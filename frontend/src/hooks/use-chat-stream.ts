import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

export interface ChatSource {
  document_id: string;
  document_title: string;
  file_name: string;
  chunk_text: string;
  relevance_score: number;
  page_numbers: number[];
  section_title?: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  createdAt: Date;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const { getToken } = useAuth();

  const sendMessage = useCallback(async (content: string, documentIds?: string[]) => {
    if (!content.trim()) return;

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // Add user message immediately
    const userMsgId = crypto.randomUUID();
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content, createdAt: new Date() },
    ]);

    // Setup assistant message placeholder
    const assistantMsgId = crypto.randomUUID();
    setMessages(prev => [
      ...prev,
      { id: assistantMsgId, role: 'assistant', content: '', sources: [], createdAt: new Date() },
    ]);

    setIsLoading(true);
    setError(null);

    try {
      // 🔐 FIX: Get Clerk auth token for authenticated requests
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required. Please sign in.');
      }

      const response = await fetch(`${API_BASE}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          session_id: sessionId,
          document_ids: documentIds || [],
          include_sources: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events from buffer
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep the incomplete event in buffer

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;

          const lines = eventBlock.split('\n');
          let eventType = '';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              dataStr = line.slice(6).trim();
            }
          }

          if (!eventType || !dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            if (eventType === 'sources') {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === assistantMsgId ? { ...msg, sources: data } : msg
                )
              );
            } else if (eventType === 'token') {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: msg.content + data.text }
                    : msg
                )
              );
            } else if (eventType === 'done') {
              // Persist session ID for multi-turn conversation
              if (data.session_id) {
                setSessionId(data.session_id);
              }
            } else if (eventType === 'error') {
              setError(data.message || 'AI response error');
            }
          } catch (e) {
            console.error('Error parsing SSE event:', eventType, dataStr, e);
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'An error occurred while generating response');
        // Remove the empty assistant message on error
        setMessages(prev => prev.filter(m => !(m.id === assistantMsgId && m.content === '')));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [getToken, sessionId]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    stopGeneration,
    clearMessages,
    setMessages,
  };
}
