import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@clerk/nextjs';
import { Document, Page, pdfjs } from 'react-pdf';
import { fetchDocumentFile, type LoadedDocumentFile } from '@/lib/document-file';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, FileText } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the PDF worker
// Use unpkg or cdnjs as fallback if local worker path is tricky in Next.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Document id, not a URL. Documents are stored behind an internal
   * `storage://` scheme that no browser can fetch, and the endpoint serving the
   * real bytes requires a Clerk token in a header — so the file has to be
   * fetched as a blob rather than pointed at.
   */
  documentId: string;
  initialPage?: number;
  exactTextChunk?: string;
}

function renderHighlightedText(text: string, exactTextChunk?: string): React.ReactNode {
  if (!exactTextChunk) return text;
  const snippet = exactTextChunk.trim().slice(0, 120);
  if (snippet.length < 12) return text;

  const lowerText = text.toLowerCase();
  const needle = snippet.slice(0, 60).toLowerCase();
  const idx = lowerText.indexOf(needle);
  if (idx === -1) return text;

  const matchLen = Math.min(text.length - idx, snippet.length);
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-300/80 text-black rounded-sm px-0.5 font-medium">
        {text.slice(idx, idx + matchLen)}
      </mark>
      {text.slice(idx + matchLen)}
    </>
  );
}

export function PDFViewerModal({
  isOpen,
  onClose,
  documentId,
  initialPage = 1,
  exactTextChunk
}: PDFViewerModalProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.0);
  const [loadedFile, setLoadedFile] = useState<LoadedDocumentFile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setPageNumber(initialPage);
      setNumPages(null);
      setScale(1.0);
    }
  }, [isOpen, initialPage]);

  // Fetch the bytes whenever the modal opens on a document, and release the
  // object URL on close so blobs do not accumulate across openings.
  useEffect(() => {
    if (!isOpen || !documentId) return;

    let cancelled = false;
    let created: string | null = null;

    setLoadError(null);
    setLoadedFile(null);

    fetchDocumentFile(documentId, getToken)
      .then((loaded) => {
        if (cancelled) {
          URL.revokeObjectURL(loaded.url);
          return;
        }
        created = loaded.url;
        setLoadedFile(loaded);
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message);
      });

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [isOpen, documentId, getToken]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const highlightPattern = (text: string, pattern: string) => {
    if (!pattern) return text;
    if (strLengthOverThreshold(text) && pattern.toLowerCase().includes(text.toLowerCase())) {
      return `<mark class="bg-yellow-300 text-black rounded-sm shadow-sm font-medium px-0.5">${text}</mark>`;
    }
    return text;
  };

  const strLengthOverThreshold = (str: string) => str.trim().length > 4;

  const textRenderer = useCallback(
    (textItem: any) => {
      if (!exactTextChunk) return textItem.str;
      return highlightPattern(textItem.str, exactTextChunk);
    },
    [exactTextChunk]
  );

  const renderedText = useMemo(
    () => (loadedFile?.textContent != null ? renderHighlightedText(loadedFile.textContent, exactTextChunk) : null),
    [loadedFile?.textContent, exactTextChunk]
  );

  if (!isOpen || typeof document === 'undefined') return null;

  const isPdf = loadedFile?.isPdf ?? false;
  const isImage = loadedFile?.contentType.startsWith('image/') ?? false;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden border border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">
              Document Viewer
            </h3>
            
            {/* Pagination Controls (PDF only) */}
            {isPdf && (
              <div className="flex items-center gap-1 sm:gap-2 bg-muted rounded-lg p-1 border border-border/50 shrink-0">
                <button
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(prev => prev - 1)}
                  className="p-1.5 hover:bg-background rounded-md disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs sm:text-sm font-medium px-1.5 sm:px-2 min-w-[3.5rem] text-center">
                  {pageNumber} / {numPages || '?'}
                </span>
                <button
                  disabled={numPages === null || pageNumber >= numPages}
                  onClick={() => setPageNumber(prev => prev + 1)}
                  className="p-1.5 hover:bg-background rounded-md disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Zoom Controls (PDF only) */}
            {isPdf && (
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border/50 mr-1 hidden md:flex">
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1.5 hover:bg-background rounded-md transition-colors">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium px-1 w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(3.0, s + 0.2))} className="p-1.5 hover:bg-background rounded-md transition-colors">
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

            {loadedFile?.url && (
              <a
                href={loadedFile.url}
                download
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                title="Download original file"
              >
                <Download className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={onClose}
              aria-label="Close document viewer"
              className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 overflow-auto bg-muted/30 p-3 sm:p-4 md:p-8 flex justify-center items-start">
          {loadError ? (
            <div className="flex flex-col items-center justify-center p-12 sm:p-20 text-destructive text-center max-w-md bg-card rounded-xl border border-border">
              <p className="font-semibold mb-2">Could not load document.</p>
              <p className="text-sm opacity-80">{loadError}</p>
            </div>
          ) : !loadedFile ? (
            <div className="flex items-center justify-center p-20 text-muted-foreground animate-pulse">
              Loading document...
            </div>
          ) : isPdf ? (
            <div className="shadow-lg border border-border/50 bg-white rounded-sm overflow-hidden transition-all duration-300 max-w-full overflow-x-auto">
              <Document
                file={loadedFile.url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-20 text-muted-foreground animate-pulse">
                    Loading PDF...
                  </div>
                }
                error={
                  <div className="flex flex-col items-center justify-center p-20 text-destructive text-center">
                    <p className="font-semibold mb-2">Failed to load PDF.</p>
                    <p className="text-sm opacity-80">The document might be missing or corrupted.</p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  customTextRenderer={textRenderer}
                  className="transition-transform duration-200"
                  loading={<div className="p-20 text-center text-muted-foreground min-h-[500px]">Loading page {pageNumber}...</div>}
                />
              </Document>
            </div>
          ) : loadedFile.textContent !== null ? (
            <div className="w-full max-w-4xl bg-card border border-border rounded-xl p-5 sm:p-8 shadow-sm">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm leading-relaxed text-foreground/90">
                {renderedText}
              </pre>
            </div>
          ) : isImage ? (
            <img
              src={loadedFile.url}
              alt="Document preview"
              className="max-w-full max-h-full rounded-lg border border-border shadow-md object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 sm:p-20 text-center max-w-md bg-card rounded-xl border border-border gap-4">
              <FileText className="w-10 h-10 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">Inline preview unavailable</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This file format ({loadedFile.contentType}) cannot be rendered inline.
                </p>
              </div>
              <a
                href={loadedFile.url}
                download
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download File
              </a>
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
