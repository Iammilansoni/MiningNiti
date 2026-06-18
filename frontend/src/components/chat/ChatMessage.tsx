import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Citation } from '@/components/ui/citation';
import type { ChatMessage as ChatMessageType, ChatSource } from '@/hooks/use-chat-stream';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Extract unique documents from sources for display
  const uniqueSources = useMemo(() => {
    if (!message.sources || message.sources.length === 0) return [];
    const sourceMap = new Map<string, ChatSource>();
    message.sources.forEach(src => {
      // Group by document ID, merging page numbers if needed, or just keep it simple and show unique file names
      if (!sourceMap.has(src.file_name)) {
        sourceMap.set(src.file_name, src);
      }
    });
    return Array.from(sourceMap.values());
  }, [message.sources]);

  return (
    <div className={cn(
      "py-6 px-4 md:px-8 w-full transition-all duration-300",
      isUser ? "bg-transparent" : "bg-card border-y border-border shadow-sm"
    )}>
      <div className="max-w-3xl mx-auto flex gap-6">
        <div className="shrink-0 pt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border shadow-inner">
              <User className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/30 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Main Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-foreground/80 prose-headings:text-foreground prose-strong:text-foreground prose-pre:bg-muted prose-pre:border prose-pre:border-border">
            {message.content ? (
              <ReactMarkdown
                components={{
                  // Enhance specific markdown elements
                  a: ({ node, ...props }) => (
                    <a className="text-blue-500 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  code: ({ node, className, children, ...props }: any) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded border border-border text-primary text-sm font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              isStreaming && <span className="animate-pulse text-primary">● ● ●</span>
            )}
          </div>

          {/* Sources Block */}
          {!isUser && uniqueSources.length > 0 && (
            <div className="pt-4 mt-4 border-t border-border animate-fade-in-up">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-3">
                <span>Sources Cited</span>
                <span className="h-[1px] flex-1 bg-border"></span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueSources.map((source, idx) => (
                  <Citation 
                    key={idx}
                    fileName={source.file_name}
                    documentId={source.document_id}
                    pageNumbers={source.page_numbers}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
