// src/lib/api.ts
// Authenticated API client for MiningNiti backend
import { GetToken } from '@clerk/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_V1 = `${API_BASE_URL}/api/v1`;

// ─────────────────────────────────────────────
// Type Definitions (aligned with backend schemas)
// ─────────────────────────────────────────────

export type DocumentStatus = 'pending' | 'processing' | 'analyzing' | 'completed' | 'failed';
export type DocumentCategory =
    | 'safety_protocol'
    | 'equipment_manual'
    | 'regulatory'
    | 'incident_report'
    | 'geological'
    | 'environmental'
    | 'training'
    | 'permit'
    | 'maintenance'
    | 'other';
export type ComplianceStatus = 'compliant' | 'warning' | 'violation' | 'pending' | 'not_applicable';

export interface Document {
    id: string;
    title: string;
    file_name: string;
    file_size: number;
    file_type: string;
    file_url: string;
    status: DocumentStatus;
    processing_error?: string | null;
    processed_at?: string | null;
    page_count?: number | null;
    word_count?: number | null;
    category?: DocumentCategory | null;
    subcategory?: string | null;
    classification_confidence?: number | null;
    summary?: string | null;
    key_points?: string[] | null;
    safety_score?: number | null;
    compliance_status?: ComplianceStatus | null;
    hazards_detected?: HazardItem[] | null;
    safety_recommendations?: string[] | null;
    entities?: DocumentEntities | null;
    tags: string[];
    created_at: string;
}

export interface HazardItem {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
}

export interface DocumentEntities {
    equipment: string[];
    chemicals: string[];
    locations: string[];
    personnel: string[];
    dates: string[];
    regulations: string[];
}

export interface DocumentListResponse {
    documents: Document[];
    total: number;
    page: number;
    page_size: number;
    stats?: {
        by_category: Record<string, number>;
        by_status: Record<string, number>;
        avg_safety_score: number | null;
    };
}

export interface DocumentAnalysis {
    category: DocumentCategory;
    subcategory?: string;
    classification_confidence: number;
    summary: string;
    key_points: string[];
    safety_score?: number;
    compliance_status: ComplianceStatus;
    hazards_detected: HazardItem[];
    safety_recommendations: string[];
    entities: DocumentEntities;
    reasoning?: Record<string, any> | null;
}

export interface DocumentAnalysisResponse {
    document_id: string;
    status: string;
    analysis?: DocumentAnalysis | null;
}

// ─────────────────────────────────────────────
// Chat Types
// ─────────────────────────────────────────────

export interface ChatSession {
    id: string;
    title: string;
    message_count: number;
    document_context: string[];
    created_at: string;
    updated_at: string;
    last_message?: string | null;
    last_message_at?: string | null;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources: ChatSource[];
    created_at: string;
    model_used?: string | null;
    response_time_ms?: number | null;
}

export interface ChatSource {
    document_id: string;
    document_title: string;
    chunk_text: string;
    relevance_score: number;
    page?: number | null;
}

export interface ChatResponse {
    message: ChatMessage;
    session_id: string;
    session_title: string;
}

export interface ChatSessionDetail {
    id: string;
    title: string;
    document_context: string[];
    system_prompt?: string | null;
    messages: ChatMessage[];
    created_at: string;
    updated_at: string;
}

// ─────────────────────────────────────────────
// Analytics Types (aligned with backend DashboardStats)
// ─────────────────────────────────────────────

export interface CategoryCount {
    category: string;
    count: number;
    percentage: number;
}

export interface DashboardStats {
    total_documents: number;
    processed_documents: number;
    pending_documents: number;
    failed_documents: number;
    total_chat_sessions: number;
    total_messages: number;
    average_safety_score?: number | null;
    documents_with_hazards: number;
    compliance_violations: number;
    compliance_warnings: number;
    documents_processed_today: number;
    documents_processed_this_week: number;
    documents_by_category: CategoryCount[];
    last_upload_at?: string | null;
    last_chat_at?: string | null;
    // legacy compat aliases used in dashboard page
    chat_sessions?: number;
    custom_prompts?: number;
}

export interface SafetyDistribution {
    range: string;
    count: number;
    percentage: number;
}

export interface SafetyAnalytics {
    average_safety_score: number;
    min_safety_score?: number | null;
    max_safety_score?: number | null;
    score_distribution: SafetyDistribution[];
    compliant_count: number;
    warning_count: number;
    violation_count: number;
}

export interface DocumentAnalytics {
    uploads_by_day: { date: string; count: number }[];
    by_category: CategoryCount[];
    by_status: { status: string; count: number }[];
    by_file_type: { type: string; count: number }[];
}

// ─────────────────────────────────────────────
// Prompt Types
// ─────────────────────────────────────────────

export interface CustomPrompt {
    id: string;
    name: string;
    prompt: string;
    description?: string | null;
    category?: string | null;
    is_default: boolean;
    created_at: string;
    updated_at?: string | null;
}

// ─────────────────────────────────────────────
// User Types
// ─────────────────────────────────────────────

export interface UserProfile {
    clerk_user_id: string;
    email?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
    company_name?: string | null;
    company_role?: string | null;
    industry_focus?: string[] | null;
    mine_sites?: string[] | null;
    is_active: boolean;
}

// ─────────────────────────────────────────────
// Job Types
// ─────────────────────────────────────────────

export interface JobStatus {
    job_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    result?: Record<string, unknown> | null;
    error?: string | null;
    created_at: string;
    updated_at: string;
    completed_at?: string | null;
}

// ─────────────────────────────────────────────
// Authenticated Fetch Helper
// ─────────────────────────────────────────────

async function fetchWithAuth(
    url: string,
    getToken: GetToken,
    options: RequestInit = {}
) {
    const token = await getToken();

    if (!token) {
        throw new Error('Authentication required');
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        try {
            const error = await response.json();
            throw new Error(error.detail || error.error || `HTTP ${response.status}`);
        } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== `HTTP ${response.status}`) {
                throw parseErr;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    }

    if (response.status === 204) return null;
    return response.json();
}

// ─────────────────────────────────────────────
// Dashboard / Analytics
// ─────────────────────────────────────────────

export const getDashboardStats = async (getToken: GetToken): Promise<DashboardStats> => {
    return fetchWithAuth(`${API_V1}/analytics/dashboard`, getToken);
};

export const getDocumentAnalytics = async (getToken: GetToken, days = 30): Promise<DocumentAnalytics> => {
    return fetchWithAuth(`${API_V1}/analytics/documents?days=${days}`, getToken);
};

export const getSafetyAnalytics = async (getToken: GetToken): Promise<SafetyAnalytics> => {
    return fetchWithAuth(`${API_V1}/analytics/safety`, getToken);
};

// ─────────────────────────────────────────────
// Documents
// ─────────────────────────────────────────────

export const getDocuments = async (
    getToken: GetToken,
    params?: {
        page?: number;
        page_size?: number;
        category?: string;
        status?: string;
        search?: string;
    }
): Promise<DocumentListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return fetchWithAuth(`${API_V1}/documents${qs ? `?${qs}` : ''}`, getToken);
};

export const getDocument = (documentId: string, getToken: GetToken): Promise<Document> =>
    fetchWithAuth(`${API_V1}/documents/${documentId}`, getToken);

/** Create a document from an UploadThing file URL */
export const createDocument = (
    data: {
        file_url: string;
        file_name: string;
        file_size: number;
        file_type: string;
        title?: string;
        tags?: string[];
    },
    getToken: GetToken
): Promise<{ id: string; title: string; file_name: string; status: DocumentStatus; job_id: string; message: string }> =>
    fetchWithAuth(`${API_V1}/documents`, getToken, {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const deleteDocument = (documentId: string, getToken: GetToken): Promise<{ message: string }> =>
    fetchWithAuth(`${API_V1}/documents/${documentId}`, getToken, { method: 'DELETE' });

export const getDocumentAnalysis = (documentId: string, getToken: GetToken): Promise<DocumentAnalysisResponse> =>
    fetchWithAuth(`${API_V1}/documents/${documentId}/analysis`, getToken);

export const reanalyzeDocument = (documentId: string, getToken: GetToken): Promise<{ message: string }> =>
    fetchWithAuth(`${API_V1}/documents/${documentId}/reanalyze`, getToken, { method: 'POST' });

// ─────────────────────────────────────────────
// Jobs
// ─────────────────────────────────────────────

export const getJobStatus = (jobId: string, getToken: GetToken): Promise<JobStatus> =>
    fetchWithAuth(`${API_V1}/jobs/${jobId}`, getToken);

export const getActiveJobs = (getToken: GetToken): Promise<{ jobs: JobStatus[]; count: number }> =>
    fetchWithAuth(`${API_V1}/jobs`, getToken);

// ─────────────────────────────────────────────
// Chat
// ─────────────────────────────────────────────

export const getChatSessions = (getToken: GetToken): Promise<ChatSession[]> =>
    fetchWithAuth(`${API_V1}/chat/sessions`, getToken);

export const createChatSession = (
    data: { title?: string; document_ids?: string[] },
    getToken: GetToken
): Promise<ChatSession> =>
    fetchWithAuth(`${API_V1}/chat/sessions`, getToken, {
        method: 'POST',
        body: JSON.stringify(data),
    });

/** Returns ChatSessionDetail which contains { messages: ChatMessage[] } */
export const getChatMessages = (sessionId: string, getToken: GetToken): Promise<ChatSessionDetail> =>
    fetchWithAuth(`${API_V1}/chat/sessions/${sessionId}`, getToken);

export const sendMessage = (
    content: string,
    sessionId: string | null,
    getToken: GetToken,
    documentIds?: string[]
): Promise<ChatResponse> =>
    fetchWithAuth(`${API_V1}/chat/send`, getToken, {
        method: 'POST',
        body: JSON.stringify({
            content,
            session_id: sessionId,
            document_ids: documentIds || [],
            include_sources: true,
        }),
    });

export const updateChatSession = (sessionId: string, title: string, getToken: GetToken): Promise<ChatSession> =>
    fetchWithAuth(`${API_V1}/chat/sessions/${sessionId}`, getToken, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
    });

export const deleteChatSession = (sessionId: string, getToken: GetToken): Promise<void> =>
    fetchWithAuth(`${API_V1}/chat/sessions/${sessionId}`, getToken, { method: 'DELETE' });

// ─────────────────────────────────────────────
// Custom Prompts
// ─────────────────────────────────────────────

export const getPrompts = (getToken: GetToken): Promise<CustomPrompt[]> =>
    fetchWithAuth(`${API_V1}/prompts`, getToken);

export const createPrompt = (
    data: { name: string; prompt: string; description?: string; category?: string },
    getToken: GetToken
): Promise<CustomPrompt> =>
    fetchWithAuth(`${API_V1}/prompts`, getToken, {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updatePrompt = (
    promptId: string,
    data: { name: string; prompt: string; description?: string; category?: string },
    getToken: GetToken
): Promise<CustomPrompt> =>
    fetchWithAuth(`${API_V1}/prompts/${promptId}`, getToken, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const deletePrompt = (promptId: string, getToken: GetToken): Promise<void> =>
    fetchWithAuth(`${API_V1}/prompts/${promptId}`, getToken, { method: 'DELETE' });

// ─────────────────────────────────────────────
// User Profile
// ─────────────────────────────────────────────

export const getUserProfile = (getToken: GetToken): Promise<UserProfile> =>
    fetchWithAuth(`${API_V1}/user/profile`, getToken);

export const updateUserProfile = (
    data: Partial<Pick<UserProfile, 'full_name' | 'company_name' | 'company_role' | 'industry_focus' | 'mine_sites'>>,
    getToken: GetToken
): Promise<UserProfile> =>
    fetchWithAuth(`${API_V1}/user/profile`, getToken, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

// ─────────────────────────────────────────────
// Compliance Audits
// ─────────────────────────────────────────────

export type AuditStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ComplianceMatrixRow {
    id: string;
    clause_index: number;
    clause_text: string;
    section_title?: string | null;
    status: 'compliant' | 'gap' | 'missing';
    assessment: string;
    confidence: number;
    evidence_chunks?: {
        chunk_text: string;
        document_title: string;
        page_numbers: number[];
        section_title?: string;
        relevance_score: number;
    }[] | null;
    recommendations?: string[] | null;
}

export interface ComplianceAudit {
    id: string;
    title: string;
    regulation_doc_id: string;
    operational_doc_ids?: string[] | null;
    status: AuditStatus;
    total_clauses?: number | null;
    processed_clauses: number;
    compliant_count?: number | null;
    gap_count?: number | null;
    missing_count?: number | null;
    overall_score?: number | null;
    processing_error?: string | null;
    completed_at?: string | null;
    created_at?: string | null;
}

export interface ComplianceAuditDetail extends ComplianceAudit {
    rows: ComplianceMatrixRow[];
}

export interface ComplianceAuditListResponse {
    audits: ComplianceAudit[];
    total: number;
}

export const getComplianceAudits = (
    getToken: GetToken,
    params?: { page?: number; page_size?: number }
): Promise<ComplianceAuditListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));
    const qs = query.toString();
    return fetchWithAuth(`${API_V1}/compliance/audits${qs ? `?${qs}` : ''}`, getToken);
};

export const createComplianceAudit = (
    data: { title: string; regulation_doc_id: string; operational_doc_ids: string[] },
    getToken: GetToken
): Promise<ComplianceAudit> =>
    fetchWithAuth(`${API_V1}/compliance/audits`, getToken, {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const getComplianceAuditDetail = (
    auditId: string,
    getToken: GetToken
): Promise<ComplianceAuditDetail> =>
    fetchWithAuth(`${API_V1}/compliance/audits/${auditId}`, getToken);

export const deleteComplianceAudit = (
    auditId: string,
    getToken: GetToken
): Promise<void> =>
    fetchWithAuth(`${API_V1}/compliance/audits/${auditId}`, getToken, { method: 'DELETE' });