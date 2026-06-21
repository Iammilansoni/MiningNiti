'use client';

import React, { useRef, useEffect } from 'react';
import { useChatStream } from '@/hooks/use-chat-stream';
import { MessageSquare, Send, StopCircle, Sparkles, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface Props {
  documentId: string;
  documentTitle: string;
}

const SUGGESTIONS = [
  'What are the key safety requirements in this document?',
  'Summarize the compliance requirements',
  'List all identified hazards and their severity',
  'What actions are recommended?',
];

export function AskDocumentAI({ documentId, documentTitle }: Props) {
  const { messages, isLoading, error, sendMessage, stopGeneration } = useChatStream();
  const [input, setInput] = React.useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim(), [documentId]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (s: string) => {
    sendMessage(s, [documentId]);
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {/* Intro */}
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Ask AI About This Document</h3>
          <p className="text-sm text-muted-foreground">
            Ask anything about <span className="font-medium text-foreground">{documentTitle}</span>. The AI will answer using only this document as context.
          </p>
        </div>

        {/* Suggestions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="text-left p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all text-sm text-muted-foreground hover:text-foreground group"
            >
              <Sparkles className="w-4 h-4 text-primary/60 group-hover:text-primary mb-2 transition-colors" />
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <InputBar
          value={input}
          onChange={setInput}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
          onStop={stopGeneration}
          isLoading={isLoading}
          inputRef={inputRef}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Context badge */}
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/15 rounded-lg text-sm">
        <FileText className="w-4 h-4 text-primary shrink-0" />
        <span className="text-muted-foreground">Answering based on:</span>
        <span className="font-medium text-foreground truncate">{documentTitle}</span>
      </div>

      {/* Messages */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-muted text-foreground rounded-tl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <>
                  {msg.content ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                      Thinking...
                    </div>
                  )}
                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sources</p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, i) => (
                          <span key={i} className="px-2 py-0.5 bg-background border border-border rounded text-[10px] text-muted-foreground font-medium">
                            {src.file_name} • p.{src.page_numbers?.[0] ?? '?'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                msg.content
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <InputBar
        value={input}
        onChange={setInput}
        onKeyDown={handleKeyDown}
        onSend={handleSend}
        onStop={stopGeneration}
        isLoading={isLoading}
        inputRef={inputRef}
      />
    </div>
  );
}

function InputBar({
  value, onChange, onKeyDown, onSend, onStop, isLoading, inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  onStop: () => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className="flex gap-2 items-end">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask a question about this document... (Enter to send)"
        rows={1}
        className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all"
        style={{ maxHeight: 120 }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = Math.min(el.scrollHeight, 120) + 'px';
        }}
      />
      {isLoading ? (
        <Button size="icon" variant="outline" onClick={onStop} className="shrink-0 h-11 w-11 text-destructive hover:text-destructive">
          <StopCircle className="w-5 h-5" />
        </Button>
      ) : (
        <Button size="icon" onClick={onSend} disabled={!value.trim()} className="shrink-0 h-11 w-11">
          <Send className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
