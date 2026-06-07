/** Format utilities shared across product pages. */

/** Format a number with locale commas, returns '0' for null/undefined. */
export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '0';
  return n.toLocaleString();
}

/** Format a date string into a short relative form or locale date. */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'never';
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/** Turn snake_case or kebab-case keys into human-readable labels. */
export function labelFromKey(key: string | null | undefined): string {
  if (!key) return '—';
  return key.replace(/[_-]/g, ' ');
}

/** Cap a string with an ellipsis if it exceeds maxLen. */
export function truncate(str: string, maxLen = 60): string {
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
}

/** Format file size from bytes to human readable form. */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
