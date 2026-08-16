"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, Zap, BookOpen, ShieldCheck, HardHat, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { useChatStream } from '@/hooks/use-chat-stream';
import { ChatMessage } from '@/components/chat/ChatMessage';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const PDFViewerModal = dynamic(() => import('@/components/chat/PDFViewerModal').then(mod => mod.PDFViewerModal), {
  ssr: false,
});

const SUGGESTIONS = [
  {
    icon: ShieldCheck,
    title: "Compliance Check",
    subtitle: "MSHA & OSHA regulations",
    prompt: "What are the methane limits in underground mines?",
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    icon: HardHat,
    title: "Safety Procedures",
    subtitle: "PPE & inspection protocols",
    prompt: "How do I conduct a daily safety inspection?",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: BookOpen,
    title: "Document Analysis",
    subtitle: "Summarize & extract insights",
    prompt: "Summarize the recent changes to PPE requirements.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Zap,
    title: "Equipment Safety",
    subtitle: "Grounding & maintenance",
    prompt: "What are the rules for electrical equipment grounding?",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
];

export default function ChatPage() {
  const { messages, isLoading, error, sendMessage, stopGeneration } = useChatStream();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [pdfViewerProps, setPdfViewerProps] = useState<{
    isOpen: boolean;
    documentId: string;
    initialPage: number;
    exactTextChunk?: string;
  }>({ isOpen: false, documentId: '', initialPage: 1, exactTextChunk: '' });

  const handleCitationClick = (documentId: string, page: number, exactTextChunk: string) => {
    setPdfViewerProps({ isOpen: true, documentId, initialPage: page, exactTextChunk });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const pending = sessionStorage.getItem('pendingPrompt');
    if (pending) {
      sessionStorage.removeItem('pendingPrompt');
      setInput(pending);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height))] -m-4 md:-m-8 w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] relative overflow-hidden bg-background">

      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute top-[30%] right-[-5%] w-[30%] h-[30%] rounded-full bg-amber-500/3 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="absolute top-0 w-full bg-background/60 backdrop-blur-xl z-10 px-8 py-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">Mining Intelligence</h1>
              <p className="text-[11px] text-muted-foreground font-medium tracking-wide">AI-powered document analysis & compliance assistant</p>
            </div>
          </div>
          {messages.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{messages.length} messages</span>
            </div>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-24 pb-36 scrollbar-hide">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={sendMessage} />
        ) : (
          <div className="flex flex-col">
            {messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={isLoading && i === messages.length - 1 && msg.role === 'assistant'}
                onCitationClick={handleCitationClick}
              />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="py-8 px-4 md:px-8 w-full">
                <div className="max-w-3xl mx-auto flex gap-6">
                  <div className="shrink-0 pt-1">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-2">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="py-4 px-4 md:px-8 w-full border-y border-destructive/20 bg-destructive/5">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-background via-background/98 to-transparent pt-14 pb-6 px-4 md:px-8 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="panel-raised relative transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.07),0_0_0_3px_hsl(var(--primary)/0.12),0_8px_28px_-8px_hsl(0_0%_0%/0.6)]">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about mining regulations, safety procedures..."
                className="min-h-[52px] max-h-32 resize-none border-0 focus-visible:ring-0 bg-transparent p-4 pr-24 text-foreground placeholder:text-muted-foreground text-[15px] rounded-2xl"
                rows={1}
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                {isLoading ? (
                  <Button
                    type="button"
                    size="icon"
                    className="size-9 rounded-xl bg-destructive/15 text-destructive hover:bg-destructive/25 border-0 shadow-none"
                    onClick={stopGeneration}
                  >
                    <StopCircle className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="icon"
                    className="size-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-30 disabled:shadow-none transition-all"
                    disabled={!input.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2.5 px-1">
              <span className="text-[10px] text-muted-foreground/60">
                <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Enter</kbd> to send · <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Shift+Enter</kbd> for new line
              </span>
              <span className="text-[10px] text-muted-foreground/60">
                Verify critical safety information
              </span>
            </div>
          </form>
        </div>
      </div>

      <PDFViewerModal
        isOpen={pdfViewerProps.isOpen}
        onClose={() => setPdfViewerProps(prev => ({ ...prev, isOpen: false }))}
        documentId={pdfViewerProps.documentId}
        initialPage={pdfViewerProps.initialPage}
        exactTextChunk={pdfViewerProps.exactTextChunk}
      />
    </div>
  );
}

// ── Empty State Component ──────────────────────────────────────────────────

function EmptyState({ onSuggestionClick }: { onSuggestionClick: (s: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* ── Masthead ────────────────────────────────────────────────────
            Left-aligned rather than centred: the transcript that replaces
            it is left-aligned, so centring here makes the first answer
            feel like the layout shifted underneath you. */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            <span className="status-pulse bg-primary text-primary" />
            Grounded in your documents
          </span>
        </div>

        <h2 className="mt-5 text-[2rem] leading-[1.1] font-semibold tracking-[-0.03em] text-foreground">
          What do you need to know?
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground max-w-lg">
          Ask about regulations, safety compliance, or operational procedures.
          Every answer cites the document and page it came from.
        </p>

        {/* ── Starters ────────────────────────────────────────────────────
            Each card shows the question it will actually ask. The previous
            version showed a category and sent a different question, so the
            result never matched what the card promised. */}
        <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(s.prompt)}
              className="panel-interactive group flex flex-col gap-3 p-4 text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className={`flex size-7 items-center justify-center rounded-lg ${s.bg} shrink-0`}>
                  <s.icon className={`size-3.5 ${s.color}`} />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {s.title}
                </span>
                <ChevronRight className="ml-auto size-3.5 text-muted-foreground/25 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary/60" />
              </div>
              <p className="text-[13.5px] leading-snug text-foreground/85 transition-colors group-hover:text-foreground">
                {s.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
