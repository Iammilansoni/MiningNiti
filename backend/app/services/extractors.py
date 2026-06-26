"""
Document Text Extractors
Page-aware text extraction for PDF, DOCX, and plain-text files.

Replaces the monolithic _download_and_extract() in DocumentService with
dedicated extractor classes that track page boundaries — required for
context-aware answers that cite page numbers.
"""

import io
import logging
import os
import tempfile
from dataclasses import dataclass, field
from typing import List, Optional

import httpx

logger = logging.getLogger(__name__)


# ── Data structures ────────────────────────────────────────────────────────────


@dataclass
class PageContent:
    """Text content of a single page."""

    page_number: int  # 1-indexed
    text: str  # raw text of this page
    char_start: int = 0  # character offset where this page starts in full_text
    char_end: int = 0  # character offset where this page ends


@dataclass
class ExtractedDocument:
    """Result of text extraction from a document file."""

    full_text: str
    pages: List[PageContent]
    total_pages: int
    file_type: str
    metadata: dict = field(default_factory=dict)  # author, title, creation_date, etc.

    @property
    def word_count(self) -> int:
        return len(self.full_text.split())


# ── Extractors ─────────────────────────────────────────────────────────────────


class PDFExtractor:
    """
    Page-aware PDF text extraction using pypdf.

    Iterates page-by-page to build a per-page text map, which is then used
    by ChunkingService to annotate each chunk with its page numbers.
    """

    def extract(self, file_path: str) -> ExtractedDocument:
        from pypdf import PdfReader

        pages: List[PageContent] = []
        char_offset = 0

        try:
            reader = PdfReader(file_path)
            for page_num, page in enumerate(reader.pages, start=1):
                page_text = page.extract_text() or ""
                pages.append(
                    PageContent(
                        page_number=page_num,
                        text=page_text,
                        char_start=char_offset,
                        char_end=char_offset + len(page_text),
                    )
                )
                char_offset += len(page_text)

            full_text = "".join(p.text for p in pages)

            # Extract PDF metadata
            metadata = {}
            if reader.metadata:
                for key, val in reader.metadata.items():
                    if val:
                        clean_key = key.lstrip("/").lower()
                        metadata[clean_key] = str(val)

            return ExtractedDocument(
                full_text=full_text,
                pages=pages,
                total_pages=len(pages),
                file_type="application/pdf",
                metadata=metadata,
            )

        except Exception as e:
            logger.error(f"pypdf extraction failed: {e}", exc_info=True)
            raise ValueError(f"Failed to extract text from PDF: {e}")


class DocxExtractor:
    """DOCX text extraction with paragraph tracking (approximate page numbers)."""

    def extract(self, file_path: str) -> ExtractedDocument:
        from docx import Document as DocxDocument

        doc = DocxDocument(file_path)
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        full_text = "\n".join(paragraphs)

        # DOCX doesn't expose true page numbers in python-docx.
        # We approximate: every ~3000 chars ≈ 1 page.
        pages = self._approximate_pages(full_text)

        return ExtractedDocument(
            full_text=full_text,
            pages=pages,
            total_pages=len(pages),
            file_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            metadata={},
        )

    def _approximate_pages(
        self, text: str, chars_per_page: int = 3000
    ) -> List[PageContent]:
        pages = []
        for i in range(0, max(1, len(text)), chars_per_page):
            page_text = text[i : i + chars_per_page]
            pages.append(
                PageContent(
                    page_number=len(pages) + 1,
                    text=page_text,
                    char_start=i,
                    char_end=i + len(page_text),
                )
            )
        return pages or [
            PageContent(page_number=1, text=text, char_start=0, char_end=len(text))
        ]


class PlainTextExtractor:
    """Plain text extraction."""

    def extract(self, file_path: str) -> ExtractedDocument:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            full_text = f.read()

        # Approximate pages for plain text too
        chars_per_page = 3000
        pages = []
        for i in range(0, max(1, len(full_text)), chars_per_page):
            page_text = full_text[i : i + chars_per_page]
            pages.append(
                PageContent(
                    page_number=len(pages) + 1,
                    text=page_text,
                    char_start=i,
                    char_end=i + len(page_text),
                )
            )

        return ExtractedDocument(
            full_text=full_text,
            pages=pages
            or [
                PageContent(
                    page_number=1, text=full_text, char_start=0, char_end=len(full_text)
                )
            ],
            total_pages=max(1, len(pages)),
            file_type="text/plain",
        )


# ── File downloader + dispatcher ───────────────────────────────────────────────

EXTENSION_MAP = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/msword": ".doc",
    "text/plain": ".txt",
}

_extractors = {
    "pdf": PDFExtractor(),
    "docx": DocxExtractor(),
    "txt": PlainTextExtractor(),
}


async def download_and_extract(file_url: str, file_type: str) -> ExtractedDocument:
    """
    Download a file from URL and extract its text content with page tracking.

    Args:
        file_url: Remote URL of the document file
        file_type: MIME type string

    Returns:
        ExtractedDocument with full text and per-page content

    Raises:
        ValueError: If file type is not supported or extraction fails
    """
    suffix = EXTENSION_MAP.get(file_type, ".tmp")

    # Validate URL scheme before downloading (SSRF prevention)
    from urllib.parse import urlparse

    parsed = urlparse(file_url)
    if parsed.scheme not in ("https", "http"):
        raise ValueError(f"Unsupported URL scheme: {parsed.scheme}")

    async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
        response = await client.get(file_url)
        response.raise_for_status()

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(response.content)
        tmp_path = tmp.name

    try:
        if "pdf" in file_type.lower():
            return _extractors["pdf"].extract(tmp_path)
        elif "docx" in file_type.lower() or "wordprocessingml" in file_type.lower():
            return _extractors["docx"].extract(tmp_path)
        else:
            return _extractors["txt"].extract(tmp_path)
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
