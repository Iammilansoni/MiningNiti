// src/lib/query-utils.ts
// Shared helpers for keeping React Query caches in sync with background state.
//
// Several pages/widgets read the documents table in different shapes (the
// registry list, the dashboard's recent-documents widget, the activity
// timeline, the compliance audit creation picker, the KPI stats). A mutation
// that creates, deletes, or changes a document's processing state has to
// invalidate all of them, or whichever ones aren't touched keep showing
// stale data until the user manually refreshes.

import type { QueryClient } from '@tanstack/react-query';
import type { Document, ComplianceAudit } from '@/lib/api';

/** Document statuses that mean a background job is still running. */
const IN_FLIGHT_DOCUMENT_STATUSES = new Set(['pending', 'processing', 'analyzing']);

export function isDocumentInFlight(status: string | null | undefined): boolean {
  return !!status && IN_FLIGHT_DOCUMENT_STATUSES.has(String(status).toLowerCase());
}

/** True if any document in the list is still being processed/analyzed. */
export function hasInFlightDocuments(docs: Pick<Document, 'status'>[] | undefined | null): boolean {
  return !!docs?.some((d) => isDocumentInFlight(d.status));
}

/** Compliance audit statuses that mean the audit is still being processed. */
const IN_FLIGHT_AUDIT_STATUSES = new Set(['pending', 'running']);

export function isAuditInFlight(status: string | null | undefined): boolean {
  return !!status && IN_FLIGHT_AUDIT_STATUSES.has(String(status).toLowerCase());
}

/** True if any audit in the list is still pending/running. */
export function hasInFlightAudits(audits: Pick<ComplianceAudit, 'status'>[] | undefined | null): boolean {
  return !!audits?.some((a) => isAuditInFlight(a.status));
}

/**
 * Invalidate every query that reads from the documents table, in whatever
 * shape it's consumed. Call this from any mutation that creates, deletes, or
 * otherwise changes a document (upload, delete, reanalyze) so every page
 * reflects the new state immediately instead of waiting for a manual
 * refresh or the next stale-time window.
 */
export function invalidateDocumentQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['documents'] });
  queryClient.invalidateQueries({ queryKey: ['recent-documents'] });
  queryClient.invalidateQueries({ queryKey: ['activity-documents'] });
  queryClient.invalidateQueries({ queryKey: ['documents-for-audit'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  queryClient.invalidateQueries({ queryKey: ['document-analytics'] });
  queryClient.invalidateQueries({ queryKey: ['safety-analytics'] });
}
