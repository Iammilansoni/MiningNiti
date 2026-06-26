import React, { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the PDF worker
// Use unpkg or cdnjs as fallback if local worker path is tricky in Next.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  initialPage?: number;
  exactTextChunk?: string;
}

export function PDFViewerModal({
  isOpen,
  onClose,
  fileUrl,
  initialPage = 1,
  exactTextChunk
}: PDFViewerModalProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.0);

  useEffect(() => {
    if (isOpen) {
      setPageNumber(initialPage);
      setScale(1.0);
    }
  }, [isOpen, initialPage]);

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
    // We do a very basic exact or partial string matching.
    // PDF text layer is fragmented, so `str` might just be a single word or partial sentence.
    // If the PDF's text chunk includes this string (and it's longer than a few chars), we highlight it.
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden border border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-lg text-foreground truncate max-w-[300px] md:max-w-md">
              Document Viewer
            </h3>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1 border border-border/50">
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(prev => prev - 1)}
                className="p-1.5 hover:bg-background rounded-md disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium px-2 min-w-[4rem] text-center">
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
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border/50 mr-2 hidden md:flex">
              <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1.5 hover:bg-background rounded-md transition-colors">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium px-1 w-12 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(3.0, s + 0.2))} className="p-1.5 hover:bg-background rounded-md transition-colors">
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 overflow-auto bg-muted/30 p-4 md:p-8 flex justify-center items-start">
          <div className="shadow-lg border border-border/50 bg-white rounded-sm overflow-hidden transition-all duration-300">
            <Document
              file={fileUrl}
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
        </div>

      </div>
    </div>
  );
}
