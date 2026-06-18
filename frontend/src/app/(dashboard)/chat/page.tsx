"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, RefreshCw } from 'lucide-react';
import { useChatStream } from '@/hooks/use-chat-stream';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ChatPage() {
  const { messages, isLoading, error, sendMessage, stopGeneration } = useChatStream();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
    <div className="flex flex-col h-[calc(100vh-[var(--header-height)])] -m-4 md:-m-8 w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] relative overflow-hidden bg-background">
      {/* Header */}
      <header className="absolute top-0 w-full bg-background/80 backdrop-blur-md z-10 px-8 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Mining Intelligence</h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Ask questions about regulations, safety, and compliance.</p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-28 pb-32 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
              <RefreshCw className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-foreground tracking-tight">How can I help you today?</h2>
            <p className="text-muted-foreground max-w-md text-base">
              Ask about MSHA/DGMS guidelines, safety procedures, or upload documents for analysis.
            </p>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl w-full px-4">
              {[
                "What are the methane limits in underground mines?",
                "Summarize the recent changes to PPE requirements.",
                "How do I conduct a daily safety inspection?",
                "What are the rules for electrical equipment grounding?"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(suggestion)}
                  className="p-4 text-sm text-left bg-card border border-border rounded-xl transition-all hover:bg-accent hover:border-primary/50 text-muted-foreground hover:text-foreground shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((msg, i) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                isStreaming={isLoading && i === messages.length - 1 && msg.role === 'assistant'} 
              />
            ))}
            {error && (
              <div className="py-4 px-4 md:px-8 w-full border-y border-destructive/20 bg-destructive/10 text-destructive text-sm flex justify-center">
                <div className="max-w-3xl w-full font-medium">Error: {error}</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 w-full bg-linear-to-t from-background via-background/90 to-transparent pt-12 pb-8 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-end gap-3 bg-card border border-border rounded-2xl p-2 shadow-xl focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all"
          >
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Mining Intelligence..."
              className="min-h-[52px] max-h-32 resize-none border-0 focus-visible:ring-0 bg-transparent p-4 text-foreground placeholder:text-muted-foreground text-base"
              rows={1}
            />
            <div className="shrink-0 pb-1 pr-1">
              {isLoading ? (
               <Button 
                  type="button" 
                  size="icon" 
                  className="rounded-xl size-10 bg-destructive/20 text-destructive hover:bg-destructive/30"
                  onClick={stopGeneration}
                >
                  <StopCircle className="w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  size="icon" 
                  className="rounded-xl size-10 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105"
                  disabled={!input.trim()}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
              )}
            </div>
          </form>
          <div className="text-center mt-3">
            <span className="text-[11px] text-muted-foreground tracking-wide">
              Mining Intelligence can make mistakes. Verify critical safety information.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
