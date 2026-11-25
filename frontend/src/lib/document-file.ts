import { GetToken } from '@clerk/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Fetch a stored document as an object URL the browser can actually render.
 *
 * Documents are persisted with an internal `storage://<key>` URL. That scheme
 * exists to confine path resolution to the upload directory on the server — it
 * is not fetchable by a browser, and handing it to a PDF viewer or to
 * window.open() only ever produced "Failed to load PDF".
 *
 * The bytes come from an authenticated endpoint, so they cannot be loaded by
 * URL alone: the Clerk token has to travel in a header, which means fetching
 * the blob ourselves and wrapping it in an object URL.
 *
 * Callers own the returned URL and must revokeObjectURL it when finished, or
 * the blob stays in memory for the lifetime of the page.
 */
export interface LoadedDocumentFile {
  url: string;
  contentType: string;
  isPdf: boolean;
  textContent: string | null;
}

/**
 * Fetch a stored document as a blob URL plus metadata/decoded text when plain text.
 * Caller owns the returned URL and must call `URL.revokeObjectURL(url)` on cleanup.
 */
export async function fetchDocumentFile(
  documentId: string,
  getToken: GetToken,
): Promise<LoadedDocumentFile> {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE_URL}/api/v1/documents/${documentId}/file`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    // 410 is the informative one: the container restarted and the file was
    // never mirrored to durable storage. Surface the server's wording rather
    // than a generic failure, because it names the fix.
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.detail ||
        body.error ||
        (res.status === 404
          ? 'Document not found.'
          : `Could not load the file (${res.status}).`),
    );
  }

  const blob = await res.blob();
  const headerType = (res.headers.get('content-type') || blob.type || '').toLowerCase();
  const magic = await blob.slice(0, 5).text().catch(() => '');
  const isPdf = headerType.includes('pdf') || magic === '%PDF-';
  const isText =
    !isPdf &&
    (headerType.startsWith('text/') ||
      headerType.includes('json') ||
      headerType.includes('csv') ||
      headerType.includes('xml'));

  return {
    url: URL.createObjectURL(blob),
    contentType: headerType || 'application/octet-stream',
    isPdf,
    textContent: isText ? await blob.text() : null,
  };
}

export async function fetchDocumentBlobUrl(
  documentId: string,
  getToken: GetToken,
): Promise<string> {
  const loaded = await fetchDocumentFile(documentId, getToken);
  return loaded.url;
}

/** Open a stored document in a new tab. */
export async function openDocumentInNewTab(
  documentId: string,
  getToken: GetToken,
): Promise<void> {
  const url = await fetchDocumentBlobUrl(documentId, getToken);
  window.open(url, '_blank', 'noopener');
  // The tab has its own reference by now; releasing ours after a beat keeps
  // this from leaking on every click.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
