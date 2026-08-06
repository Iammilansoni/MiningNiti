"""
Layout-aware PDF extraction: tables and OCR.

Why this exists
---------------
`pypdf`'s page.extract_text() returns a flat character stream. For prose that
is fine. For the documents this product actually ingests it is not: MSHA
regulations, equipment maintenance schedules, and dust sampling reports are
largely *tables*, and flattening a table produces runs like

    "Bolt spacing 5 4 Roof height 6 8 Support type Resin Mechanical"

which is worse than useless — it is confidently wrong, and it gets embedded,
retrieved, and cited as though it were meaningful.

Scanned documents are the other half of the gap. An incident report that was
photocopied and re-scanned yields *zero* extractable characters, so today it
becomes an empty document that silently fails ingestion.

This module adds two things to the PDF path:

  * table extraction via pdfplumber, rendered as Markdown so the structure
    survives chunking and is legible to the LLM
  * an OCR fallback for pages whose extractable text falls below a threshold

Both degrade gracefully. If pdfplumber is missing, the caller falls back to
pypdf. If Tesseract is not installed, OCR logs a warning once and is skipped,
so local development without system binaries still works.

Licensing note: PyMuPDF (fitz) is the more capable library here and is
deliberately not used — it is AGPL-3.0, which is incompatible with this
project's MIT licence. pdfplumber (MIT), pypdf (BSD), pytesseract (Apache-2.0)
and pdf2image (MIT) are all compatible.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import List, Optional

from app.config import settings

logger = logging.getLogger(__name__)

# Warn once per process rather than once per page.
_ocr_unavailable_logged = False


@dataclass
class PageExtraction:
    """Text for one page, plus how it was obtained."""

    text: str
    tables_found: int = 0
    used_ocr: bool = False


# ── Table rendering ────────────────────────────────────────────────────────────


def table_to_markdown(table: List[List[Optional[str]]]) -> str:
    """
    Render an extracted table as a Markdown table.

    Markdown is used rather than CSV or raw text because it keeps the
    header/row relationship explicit in a form LLMs read reliably, and it
    survives the chunker (which splits on sentence boundaries, not pipes).

    Ragged rows are padded, None cells become empty, and embedded pipes and
    newlines are escaped so a single cell cannot break the table structure.
    """
    if not table:
        return ""

    def clean(cell: Optional[str]) -> str:
        if cell is None:
            return ""
        return str(cell).replace("|", "\\|").replace("\n", " ").strip()

    rows = [[clean(c) for c in row] for row in table]
    width = max(len(r) for r in rows)
    rows = [r + [""] * (width - len(r)) for r in rows]

    # Drop rows that are entirely empty — pdfplumber emits these for ruled
    # lines that are not really rows.
    rows = [r for r in rows if any(c for c in r)]
    if not rows:
        return ""

    header, body = rows[0], rows[1:]

    lines = [
        "| " + " | ".join(header) + " |",
        "| " + " | ".join("---" for _ in header) + " |",
    ]
    lines.extend("| " + " | ".join(r) + " |" for r in body)
    return "\n".join(lines)


# ── OCR ────────────────────────────────────────────────────────────────────────


def ocr_available() -> bool:
    """True if both pytesseract and the Tesseract binary are usable."""
    try:
        import pytesseract

        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False


def ocr_page(pdf_path: str, page_number: int) -> str:
    """
    OCR a single 1-indexed page of a PDF.

    Rasterises just that page rather than the whole document, so a 500-page
    file with one scanned insert does not cost 500 page renders.
    """
    global _ocr_unavailable_logged

    try:
        import pytesseract
        from pdf2image import convert_from_path
    except ImportError:
        if not _ocr_unavailable_logged:
            logger.warning(
                "OCR requested but pytesseract/pdf2image are not installed — "
                "scanned pages will yield no text"
            )
            _ocr_unavailable_logged = True
        return ""

    try:
        images = convert_from_path(
            pdf_path,
            dpi=settings.OCR_DPI,
            first_page=page_number,
            last_page=page_number,
        )
        if not images:
            return ""
        return pytesseract.image_to_string(
            images[0], lang=settings.OCR_LANGUAGE
        ).strip()
    except Exception as e:
        if not _ocr_unavailable_logged:
            logger.warning(
                f"OCR unavailable ({e}). Install the tesseract-ocr and "
                f"poppler-utils system packages to read scanned documents."
            )
            _ocr_unavailable_logged = True
        return ""


# ── Page extraction ────────────────────────────────────────────────────────────


def extract_page(
    plumber_page,
    pdf_path: str,
    page_number: int,
    ocr_budget: List[int],
) -> PageExtraction:
    """
    Extract one page: prose, then tables, then OCR if it looks scanned.

    `ocr_budget` is a single-element list used as a mutable counter so the
    per-document OCR cap is shared across pages without a class.
    """
    text = (plumber_page.extract_text() or "").strip()
    tables_found = 0

    if settings.ENABLE_TABLE_EXTRACTION:
        try:
            tables = plumber_page.extract_tables() or []
        except Exception as e:
            logger.debug(f"Table extraction failed on page {page_number}: {e}")
            tables = []

        rendered = [md for t in tables if (md := table_to_markdown(t))]
        if rendered:
            tables_found = len(rendered)
            # Labelled so a retrieved chunk makes clear it is tabular data and
            # the model does not read the pipes as prose.
            text = (
                f"{text}\n\n"
                + "\n\n".join(
                    f"[Table {i} on page {page_number}]\n{md}"
                    for i, md in enumerate(rendered, start=1)
                )
            ).strip()

    used_ocr = False
    if settings.ENABLE_OCR and len(text) < settings.OCR_MIN_CHARS and ocr_budget[0] > 0:
        ocr_text = ocr_page(pdf_path, page_number)
        if ocr_text:
            ocr_budget[0] -= 1
            used_ocr = True
            # Keep whatever little native text there was; OCR supplements it.
            text = f"{text}\n{ocr_text}".strip() if text else ocr_text

    return PageExtraction(text=text, tables_found=tables_found, used_ocr=used_ocr)
