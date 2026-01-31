'use client';

import React, { useState, useRef, FormEvent, useEffect, KeyboardEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Upload, 
  Copy, 
  Play, 
  Pause, 
  Bot, 
  User, 
  Sparkles,
  Settings,
  ArrowLeft,
  Database,
  Globe,
  Layers,
  Check,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

interface ChatItem {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
}

const suggestedQueries = [
  'What are the key mining safety regulations in India?',
  'Explain the process for mining lease renewal',
  'What are the environmental clearance requirements?',
  'Latest DGMS circulars for coal mines',
  'Mining safety officer qualifications',
];

const sourceOptions = [
  { value: 'database', label: 'Database', icon: Database },
  { value: 'internet', label: 'Internet', icon: Globe },
  { value: 'both', label: 'Both', icon: Layers },
];

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<ChatItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState('both');
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatLog]);

  const handleSubmit = async (messageToSend: string) => {
    if (!messageToSend.trim()) return;
    
    setIsSending(true);
    setError(null);
    
    const newMessage: ChatItem = {
      id: Date.now().toString(),
      message: messageToSend,
      response: '',
      timestamp: new Date(),
    };

    setChatLog(prev => [...prev, newMessage]);
    setMessage('');

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/chat',
        { input_query: messageToSend, source },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setChatLog(prev => 
        prev.map(item => 
          item.id === newMessage.id 
            ? { ...item, response: response.data.response }
            : item
        )
      );
    } catch (err) {
      setError('Failed to send message. Please try again.');
      setChatLog(prev => prev.filter(item => item.id !== newMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit(message);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(message);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayVoice = (text: string) => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlaying(false);
    setIsPlaying(true);
    speechSynthesis.speak(utterance);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await axios.post(
          process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/extract_text_from_pdf',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setMessage(response.data.text);
      } catch (err) {
        setError('Failed to extract text from PDF. Please try again.');
      }
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-card/50">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden">
              <Image
                src="/icon.png"
                alt="MiningNiti Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-display font-bold text-xl">MiningNiti</span>
          </Link>
        </div>

        {/* Suggested Queries */}
        <div className="flex-1 overflow-auto p-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Suggested Queries
          </h3>
          <div className="space-y-2">
            {suggestedQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => handleSubmit(query)}
                disabled={isSending}
                className="w-full text-left p-3 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>

        {/* Source Selection */}
        <div className="p-4 border-t border-border">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Search Source
          </h3>
          <div className="space-y-2">
            {sourceOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSource(option.value)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-colors',
                  source === option.value
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-secondary'
                )}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Link href="/" className="lg:hidden">
              <div className="relative h-10 w-10 rounded-xl overflow-hidden">
                <Image
                  src="/icon.png"
                  alt="MiningNiti Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <div>
              <h1 className="font-semibold">AI Assistant</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Online • Powered by RAG
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="muted" className="hidden sm:flex">
              Source: {sourceOptions.find(s => s.value === source)?.label}
            </Badge>
            <ThemeToggle className="lg:hidden" />
          </div>
        </header>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-auto p-4 space-y-6 scrollbar-thin"
        >
          {chatLog.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md"
              >
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">
                  Welcome to MiningNiti
                </h2>
                <p className="text-muted-foreground mb-6">
                  Ask me anything about mining compliance, regulations, acts, or circulars.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedQueries.slice(0, 3).map((query, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubmit(query)}
                      className="text-xs"
                    >
                      {query.slice(0, 30)}...
                    </Button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <AnimatePresence>
              {chatLog.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* User Message */}
                  <div className="flex gap-3 justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-primary text-primary-foreground p-4">
                      <p className="text-sm">{item.message}</p>
                      <span className="text-xs opacity-70 mt-2 block">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-accent" />
                    </div>
                  </div>

                  {/* Bot Response */}
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="max-w-[80%]">
                      {item.response ? (
                        <div className="rounded-2xl rounded-tl-md bg-secondary p-4">
                          <p className="text-sm whitespace-pre-wrap">{item.response}</p>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(item.response, item.id)}
                              className="h-8 px-2"
                            >
                              {copiedId === item.id ? (
                                <Check className="h-4 w-4 text-success" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlayVoice(item.response)}
                              className="h-8 px-2"
                            >
                              {isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl rounded-tl-md bg-secondary p-4">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about mining regulations..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ minHeight: '48px', maxHeight: '150px' }}
                />
                <label className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-primary transition-colors">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="h-5 w-5" />
                </label>
              </div>
              <Button 
                type="submit" 
                size="icon" 
                className="h-12 w-12 rounded-xl"
                disabled={isSending || !message.trim()}
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
