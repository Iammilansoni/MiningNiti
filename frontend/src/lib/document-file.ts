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
export async function fetchDocumentBlobUrl(
  documentId: string,
  getToken: GetToken,
): Promise<string> {
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

  return URL.createObjectURL(await res.blob());
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
