import { useState, useCallback, useRef } from 'react';

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

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

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
      { id: userMsgId, role: 'user', content, createdAt: new Date() }
    ]);

    // Setup assistant message placeholder
    const assistantMsgId = crypto.randomUUID();
    setMessages(prev => [
      ...prev, 
      { id: assistantMsgId, role: 'assistant', content: '', sources: [], createdAt: new Date() }
    ]);

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: Add Authorization header here if using Clerk/Auth
        },
        body: JSON.stringify({
          content,
          document_ids: documentIds,
          include_sources: true
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE events from buffer
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep the incomplete event in buffer

        for (const line of lines) {
          if (!line.startsWith('event: ')) continue;
          
          const eventMatch = line.match(/^event: (.+)\ndata: (.+)$/);
          if (!eventMatch) continue;

          const [, event, dataStr] = eventMatch;
          
          try {
            const data = JSON.parse(dataStr);

            if (event === 'sources') {
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMsgId 
                  ? { ...msg, sources: data } 
                  : msg
              ));
            } else if (event === 'token') {
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMsgId 
                  ? { ...msg, content: msg.content + data.text } 
                  : msg
              ));
            } else if (event === 'error') {
              setError(data.message);
              break;
            }
          } catch (e) {
            console.error('Error parsing SSE data', e, dataStr);
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'An error occurred while generating response');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    setMessages
  };
}
