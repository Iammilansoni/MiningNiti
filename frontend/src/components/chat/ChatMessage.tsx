import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Citation } from '@/components/ui/citation';
import type { ChatMessage as ChatMessageType, ChatSource } from '@/hooks/use-chat-stream';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  onCitationClick?: (fileUrl: string, page: number, exactTextChunk: string) => void;
}

export function ChatMessage({ message, isStreaming, onCitationClick }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const uniqueSources = useMemo(() => {
    if (!message.sources || message.sources.length === 0) return [];
    const sourceMap = new Map<string, ChatSource>();
    message.sources.forEach(src => {
      if (!sourceMap.has(src.file_name)) {
        sourceMap.set(src.file_name, src);
      }
    });
    return Array.from(sourceMap.values());
  }, [message.sources]);

  const processedContent = useMemo(() => {
    if (!message.content) return '';
    return message.content.replace(
      /\[(.*?)\]/g,
      (match, contentStr) => {
        const parts = contentStr.split(',');
        const fileCandidate = parts[0].trim();
        let page = 1;

        if (parts.length > 1) {
          const pageMatch = parts[1].match(/\d+/);
          if (pageMatch) page = parseInt(pageMatch[0], 10);
        }

        const source = message.sources?.find(s =>
          s.file_name.toLowerCase() === fileCandidate.toLowerCase() ||
          s.document_title.toLowerCase() === fileCandidate.toLowerCase() ||
          fileCandidate.toLowerCase().includes(s.file_name.toLowerCase())
        );

        if (source) {
          return `[${contentStr}](citation://${encodeURIComponent(source.file_name)}/${page})`;
        }
        return match;
      }
    );
  }, [message.content, message.sources]);

  return (
    <div className={cn(
      "py-6 px-4 md:px-8 w-full transition-all duration-200",
      isUser
        ? "bg-transparent"
        : "bg-primary/[0.02] border-y border-border/30"
    )}>
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center border border-border">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/20">
              <Bot className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Role label */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {isUser ? 'You' : 'Mining AI'}
            </span>
            {!isUser && isStreaming && (
              <span className="flex items-center gap-1 text-[10px] text-primary/70 font-medium">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                generating
              </span>
            )}
          </div>

          {/* Message body */}
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-foreground/85 prose-headings:text-foreground prose-strong:text-foreground prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none">
            {message.content ? (
              <ReactMarkdown
                urlTransform={(value) => value}
                components={{
                  a: ({ href, children, ...props }) => {
                    if (href?.startsWith("citation://")) {
                      const parts = href.replace("citation://", "").split("/");
                      const file = decodeURIComponent(parts[0]);
                      const page = parseInt(parts[1], 10);
                      const source = message.sources?.find(s => s.file_name.toLowerCase() === file.toLowerCase());

                      return (
                        <button
                          type="button"
                          onClick={() => {
                            if (source?.file_url && onCitationClick) {
                              onCitationClick(source.file_url, page, source.exact_text_chunk || '');
                            }
                          }}
                          className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium transition-all duration-150 mx-0.5 border cursor-pointer align-baseline",
                            source?.file_url
                              ? "bg-primary/15 text-primary border-primary/20 hover:bg-primary/25 hover:border-primary/40"
                              : "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-60"
                          )}
                          title={source?.file_url ? "Open in document viewer" : "Document unavailable"}
                        >
                          {children}
                          {source?.file_url && <ExternalLink className="w-2.5 h-2.5 opacity-60" />}
                        </button>
                      );
                    }
                    return <a className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer" href={href} {...props}>{children}</a>;
                  },
                  code: ({ className, children, ...props }: any) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/15 text-primary text-[13px] font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>{children}</code>
                    );
                  }
                }}
              >
                {processedContent}
              </ReactMarkdown>
            ) : (
              isStreaming && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )
            )}
          </div>

          {/* Sources */}
          {!isUser && uniqueSources.length > 0 && (
            <div className="pt-4 mt-4 border-t border-border/30 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Sources</span>
                <div className="h-px flex-1 bg-border/30" />
                <span className="text-[10px] text-muted-foreground/40">{uniqueSources.length} document{uniqueSources.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {uniqueSources.map((source, idx) => (
                  <Citation
                    key={idx}
                    fileName={source.file_name}
                    documentId={source.document_id}
                    pageNumbers={source.page_numbers}
                    onClick={() => {
                      if (source.file_url && onCitationClick) {
                        onCitationClick(source.file_url, source.page_numbers?.[0] || 1, source.exact_text_chunk || '');
                      }
                    }}
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
