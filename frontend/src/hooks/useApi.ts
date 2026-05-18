// src/hooks/useApi.ts
// React Query hooks for all API endpoints

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import {
    // Dashboard / Analytics
    getDashboardStats,
    getDocumentAnalytics,
    getSafetyAnalytics,
    // Documents
    getDocuments,
    getDocument,
    createDocument,
    deleteDocument,
    getDocumentAnalysis,
    reanalyzeDocument,
    // Jobs
    getJobStatus,
    getActiveJobs,
    // Chat
    getChatSessions,
    createChatSession,
    getChatMessages,
    sendMessage,
    updateChatSession,
    deleteChatSession,
    // Prompts
    getPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    // User
    getUserProfile,
    updateUserProfile,
    // Types
    type DashboardStats,
    type Document,
    type DocumentListResponse,
    type DocumentAnalysisResponse,
    type ChatSession,
    type ChatSessionDetail,
    type ChatResponse,
    type CustomPrompt,
    type UserProfile,
    type SafetyAnalytics,
    type DocumentAnalytics,
    type JobStatus,
} from '@/lib/api';

// ─────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────

export const queryKeys = {
    dashboard: ['dashboard'] as const,
    documentAnalytics: (days?: number) => ['documentAnalytics', days ?? 30] as const,
    safetyAnalytics: ['safetyAnalytics'] as const,
    documents: (params?: object) => ['documents', params] as const,
    document: (id: string) => ['document', id] as const,
    documentAnalysis: (id: string) => ['documentAnalysis', id] as const,
    jobStatus: (id: string) => ['jobStatus', id] as const,
    activeJobs: ['activeJobs'] as const,
    chatSessions: ['chatSessions'] as const,
    chatMessages: (sessionId: string) => ['chatMessages', sessionId] as const,
    prompts: ['prompts'] as const,
    userProfile: ['userProfile'] as const,
};

// ─────────────────────────────────────────────
// Dashboard & Analytics
// ─────────────────────────────────────────────

export function useDashboardStats() {
    const { getToken } = useAuth();
    return useQuery<DashboardStats>({
        queryKey: queryKeys.dashboard,
        queryFn: () => getDashboardStats(getToken),
        staleTime: 30_000,
    });
}

export function useDocumentAnalytics(days = 30) {
    const { getToken } = useAuth();
    return useQuery<DocumentAnalytics>({
        queryKey: queryKeys.documentAnalytics(days),
        queryFn: () => getDocumentAnalytics(getToken, days),
        staleTime: 60_000,
    });
}

export function useSafetyAnalytics() {
    const { getToken } = useAuth();
    return useQuery<SafetyAnalytics>({
        queryKey: queryKeys.safetyAnalytics,
        queryFn: () => getSafetyAnalytics(getToken),
        staleTime: 60_000,
    });
}

// ─────────────────────────────────────────────
// Documents
// ─────────────────────────────────────────────

export function useDocuments(params?: {
    page?: number;
    page_size?: number;
    category?: string;
    status?: string;
    search?: string;
}) {
    const { getToken } = useAuth();
    return useQuery<DocumentListResponse>({
        queryKey: queryKeys.documents(params),
        queryFn: () => getDocuments(getToken, params),
        staleTime: 15_000,
    });
}

export function useDocument(documentId: string | null) {
    const { getToken } = useAuth();
    return useQuery<Document>({
        queryKey: queryKeys.document(documentId!),
        queryFn: () => getDocument(documentId!, getToken),
        enabled: !!documentId,
    });
}

export function useDocumentAnalysis(documentId: string | null) {
    const { getToken } = useAuth();
    return useQuery<DocumentAnalysisResponse>({
        queryKey: queryKeys.documentAnalysis(documentId!),
        queryFn: () => getDocumentAnalysis(documentId!, getToken),
        enabled: !!documentId,
        refetchInterval: (query) => {
            const data = query.state.data as DocumentAnalysisResponse | undefined;
            if (!data) return false;
            const status = data.status;
            return status === 'pending' || status === 'processing' || status === 'analyzing'
                ? 3000
                : false;
        },
    });
}

export function useCreateDocument() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            file_url: string;
            file_name: string;
            file_size: number;
            file_type: string;
            title?: string;
            tags?: string[];
        }) => createDocument(data, getToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            queryClient.invalidateQueries({ queryKey: queryKeys.activeJobs });
        },
    });
}

export function useDeleteDocument() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (documentId: string) => deleteDocument(documentId, getToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });
}

export function useReanalyzeDocument() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (documentId: string) => reanalyzeDocument(documentId, getToken),
        onSuccess: (_data, documentId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.document(documentId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.documentAnalysis(documentId) });
        },
    });
}

// ─────────────────────────────────────────────
// Jobs
// ─────────────────────────────────────────────

export function useJobStatus(jobId: string | null) {
    const { getToken } = useAuth();
    return useQuery<JobStatus>({
        queryKey: queryKeys.jobStatus(jobId!),
        queryFn: () => getJobStatus(jobId!, getToken),
        enabled: !!jobId,
        refetchInterval: (query) => {
            const data = query.state.data as JobStatus | undefined;
            const status = data?.status;
            return status === 'pending' || status === 'processing' ? 2000 : false;
        },
    });
}

export function useActiveJobs() {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: queryKeys.activeJobs,
        queryFn: () => getActiveJobs(getToken),
        refetchInterval: 5000,
    });
}

// ─────────────────────────────────────────────
// Chat Sessions
// ─────────────────────────────────────────────

export function useChatSessions() {
    const { getToken } = useAuth();
    return useQuery<ChatSession[]>({
        queryKey: queryKeys.chatSessions,
        queryFn: () => getChatSessions(getToken),
    });
}

export function useCreateChatSession() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { title?: string; document_ids?: string[] }) =>
            createChatSession(data, getToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.chatSessions });
        },
    });
}

/** Returns full session detail including messages array */
export function useChatMessages(sessionId: string | null) {
    const { getToken } = useAuth();
    return useQuery<ChatSessionDetail>({
        queryKey: queryKeys.chatMessages(sessionId!),
        queryFn: () => getChatMessages(sessionId!, getToken),
        enabled: !!sessionId,
    });
}

export function useSendMessage() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation<ChatResponse, Error, {
        content: string;
        sessionId: string | null;
        documentIds?: string[];
    }>({
        mutationFn: ({ content, sessionId, documentIds }) =>
            sendMessage(content, sessionId, getToken, documentIds),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.chatSessions });
            if (data.session_id) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.chatMessages(data.session_id),
                });
            }
        },
    });
}

export function useUpdateChatSession() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId, title }: { sessionId: string; title: string }) =>
            updateChatSession(sessionId, title, getToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.chatSessions });
        },
    });
}

export function useDeleteChatSession() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionId: string) => deleteChatSession(sessionId, getToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.chatSessions });
        },
    });
}

// ─────────────────────────────────────────────
// Custom Prompts
// ─────────────────────────────────────────────

export function usePrompts() {
    const { getToken } = useAuth();
    return useQuery<CustomPrompt[]>({
        queryKey: queryKeys.prompts,
        queryFn: () => getPrompts(getToken),
    });
}

export function useCreatePrompt() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { name: string; prompt: string; description?: string; category?: string }) =>
            createPrompt(data, getToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.prompts });
        },
    });
}

export function useUpdatePrompt() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            promptId,
            data,
        }: {
            promptId: string;
            data: { name: string; prompt: string; description?: string; category?: string };
        }) => updatePrompt(promptId, data, getToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.prompts });
        },
    });
}

export function useDeletePrompt() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (promptId: string) => deletePrompt(promptId, getToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.prompts });
        },
    });
}

// ─────────────────────────────────────────────
// User Profile
// ─────────────────────────────────────────────

export function useUserProfile() {
    const { getToken } = useAuth();
    return useQuery<UserProfile>({
        queryKey: queryKeys.userProfile,
        queryFn: () => getUserProfile(getToken),
    });
}

export function useUpdateUserProfile() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (
            data: Partial<Pick<UserProfile, 'full_name' | 'company_name' | 'company_role' | 'industry_focus' | 'mine_sites'>>
        ) => updateUserProfile(data, getToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
        },
    });
}
