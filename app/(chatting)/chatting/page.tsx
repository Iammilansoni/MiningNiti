'use client';

import React, { useState, useRef, FormEvent, useEffect, KeyboardEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Upload, 
  Copy, 
  Play, 
  Pause, 
  Bot, 
  User, 
  Trash2,
  Home,
  Database,
  Globe,
  Layers,
  Check,
  Loader2,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  PanelLeftClose,
  PanelLeft,
  Menu,
  FileText,
  Square,
  Sparkles,
  ChevronDown,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { SourceCitation } from '@/components/ui/source-citation';
import { 
  Sheet, 
  SheetContent
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface Source {
  file: string;
  page: number;
}

interface ChatItem {
  id: string;
  message: string;
  response: string;
  sources: Source[];
  timestamp: Date;
  isStreaming: boolean;
}

interface UploadedDocument {
  name: string;
  uploadedAt: Date;
  chunks: number;
}

interface UploadStatus {
  isUploading: boolean;
  success: boolean | null;
  message: string;
  filename: string;
}

const suggestedQueries = [
  'What are the key mining safety regulations in India?',
  'Explain the process for mining lease renewal',
  'What are the environmental clearance requirements?',
  'Latest DGMS circulars for coal mines',
  'Mining safety officer qualifications',
];

const sourceOptions = [
  { value: 'database', label: 'Database', icon: Database, description: 'Search indexed documents' },
  { value: 'internet', label: 'Internet', icon: Globe, description: 'Search the web' },
  { value: 'both', label: 'Both', icon: Layers, description: 'Combined search' },
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<ChatItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState('database');
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    success: null,
    message: '',
    filename: ''
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatLog]);

  useEffect(() => {
    const handleClickOutside = () => setShowSourceDropdown(false);
    if (showSourceDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSourceDropdown]);

  const parseSourcesFromResponse = (text: string): { content: string; sources: Source[] } => {
    const sourcesMatch = text.match(/\[SOURCES\](\[.*\])$/);
    if (sourcesMatch) {
      try {
        const sources = JSON.parse(sourcesMatch[1]);
        const content = text.replace(/\n\n\[SOURCES\]\[.*\]$/, '');
        return { content, sources };
      } catch {
        return { content: text, sources: [] };
      }
    }
    return { content: text, sources: [] };
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsSending(false);
      setChatLog(prev => 
        prev.map(item => 
          item.isStreaming 
            ? { ...item, isStreaming: false, response: item.response + '\n\n*[Generation stopped]*' }
            : item
        )
      );
    }
  };

  const handleSubmit = async (messageToSend: string) => {
    if (!messageToSend.trim()) return;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    
    setIsSending(true);
    setError(null);
    
    const newMessage: ChatItem = {
      id: Date.now().toString(),
      message: messageToSend,
      response: '',
      sources: [],
      timestamp: new Date(),
      isStreaming: true,
    };

    setChatLog(prev => [...prev, newMessage]);
    setMessage('');
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_query: messageToSend, source }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response body');

      let fullResponse = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setChatLog(prev => 
          prev.map(item => 
            item.id === newMessage.id ? { ...item, response: fullResponse } : item
          )
        );
      }

      const { content, sources } = parseSourcesFromResponse(fullResponse);
      setChatLog(prev => 
        prev.map(item => 
          item.id === newMessage.id 
            ? { ...item, response: content, sources, isStreaming: false }
            : item
        )
      );
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('Failed to send message. Please check if the backend is running.');
      setChatLog(prev => prev.filter(item => item.id !== newMessage.id));
    } finally {
      setIsSending(false);
      abortControllerRef.current = null;
    }
  };

  const handleFormSubmit = (e: FormEvent) => { e.preventDefault(); handleSubmit(message); };
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(message); }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayVoice = (text: string) => {
    if (isPlaying) { speechSynthesis.cancel(); setIsPlaying(false); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlaying(false);
    setIsPlaying(true);
    speechSynthesis.speak(utterance);
  };

  const handleClearChat = () => { setChatLog([]); setError(null); };
  const handleNewChat = () => { handleClearChat(); setMobileMenuOpen(false); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadStatus({ isUploading: true, success: null, message: 'Processing...', filename: file.name });
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch(`${BACKEND_URL}/upload`, { method: 'POST', body: formData });
        const data = await response.json();
        if (response.ok) {
          setUploadStatus({ isUploading: false, success: true, message: `Indexed ${data.chunks_indexed} chunks`, filename: file.name });
          setUploadedDocs(prev => [...prev, { name: file.name, uploadedAt: new Date(), chunks: data.chunks_indexed || 0 }]);
        } else throw new Error(data.detail || 'Upload failed');
      } catch (err) {
        setUploadStatus({ isUploading: false, success: false, message: err instanceof Error ? err.message : 'Failed', filename: file.name });
      }
      setTimeout(() => setUploadStatus({ isUploading: false, success: null, message: '', filename: '' }), 5000);
      e.target.value = '';
    }
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 cursor-pointer touch-manipulation"
            onClick={() => {
              if (isMobile) {
                setMobileMenuOpen(false);
              }
            }}
          >
            <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-primary/10 flex-shrink-0">
              <Image src="/icon.png" alt="MiningNiti" fill className="object-contain p-1" sizes="36px" />
            </div>
            <span className="font-display font-bold text-lg">MiningNiti</span>
          </Link>
          {isMobile ? (
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="h-8 w-8">
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-8 w-8">
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={handleNewChat} className="w-full justify-start gap-2" variant="outline">
          <Plus className="h-4 w-4" /> New Chat
        </Button>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documents</h3>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3 w-3 mr-1" /> Upload
          </Button>
        </div>
        {uploadedDocs.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-auto">
            {uploadedDocs.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 text-xs">
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="truncate flex-1">{doc.name}</span>
                <Badge variant="muted" className="text-[10px] px-1.5">{doc.chunks}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
            <Upload className="h-5 w-5 mx-auto mb-1 opacity-50" /> No documents
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Suggested</h3>
        <div className="space-y-1.5">
          {suggestedQueries.map((query, i) => (
            <button key={i} onClick={() => { handleSubmit(query); if (isMobile) setMobileMenuOpen(false); }} disabled={isSending}
              className="w-full text-left p-2.5 rounded-lg text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-all line-clamp-2">
              {query}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Source</h3>
        <div className="space-y-1.5">
          {sourceOptions.map((opt) => (
            <button key={opt.value} onClick={() => setSource(opt.value)}
              className={cn('w-full flex items-center gap-3 p-2.5 rounded-lg text-xs transition-all',
                source === opt.value ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-secondary')}>
              <opt.icon className="h-4 w-4" />
              <div className="text-left"><div className="font-medium">{opt.label}</div><div className="text-[10px] opacity-70">{opt.description}</div></div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between">
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={handleClearChat} title="Clear" className="h-9 w-9"><Trash2 className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" asChild className="h-9 w-9"><Link href="/" title="Home"><Home className="h-4 w-4" /></Link></Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />

      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="hidden md:flex flex-col border-r border-border bg-card/50 backdrop-blur-sm overflow-hidden">
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0 [&>button]:hidden">
          <SidebarContent isMobile />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              className="md:hidden h-9 w-9" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMobileMenuOpen(true);
              }}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {!sidebarOpen && <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9" onClick={() => setSidebarOpen(true)}><PanelLeft className="h-5 w-5" /></Button>}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center"><Sparkles className="h-4 w-4 text-white" /></div>
              <div><h1 className="font-semibold text-sm">AI Assistant</h1><div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />Online</div></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs hidden sm:flex" onClick={(e) => { e.stopPropagation(); setShowSourceDropdown(!showSourceDropdown); }}>
                {React.createElement(sourceOptions.find(s => s.value === source)?.icon || Database, { className: "h-3.5 w-3.5" })}
                {sourceOptions.find(s => s.value === source)?.label}
                <ChevronDown className="h-3 w-3" />
              </Button>
              {showSourceDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 py-1 bg-popover border border-border rounded-lg shadow-lg z-50">
                  {sourceOptions.map((opt) => (
                    <button key={opt.value} onClick={() => { setSource(opt.value); setShowSourceDropdown(false); }}
                      className={cn('w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-secondary', source === opt.value && 'bg-primary/10 text-primary')}>
                      <opt.icon className="h-4 w-4" />{opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/"><Home className="h-4 w-4" /></Link></Button>
            <ThemeToggle className="md:hidden" />
          </div>
        </header>

        <AnimatePresence>
          {(uploadStatus.isUploading || uploadStatus.success !== null) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className={cn('px-4 py-2.5 flex items-center gap-3 text-xs border-b',
                uploadStatus.isUploading && 'bg-primary/5 text-primary border-primary/20',
                uploadStatus.success === true && 'bg-success/5 text-success border-success/20',
                uploadStatus.success === false && 'bg-destructive/5 text-destructive border-destructive/20')}>
              {uploadStatus.isUploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {uploadStatus.success === true && <CheckCircle className="h-3.5 w-3.5" />}
              {uploadStatus.success === false && <AlertCircle className="h-3.5 w-3.5" />}
              <FileText className="h-3.5 w-3.5" /><span className="font-medium">{uploadStatus.filename}</span><span className="opacity-80">{uploadStatus.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={chatContainerRef} className="flex-1 overflow-auto scrollbar-thin">
          {chatLog.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-5">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold mb-2">Welcome to MiningNiti AI</h2>
                <p className="text-sm text-muted-foreground mb-6">Upload a PDF and ask about mining compliance, regulations, or circulars.</p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2"><Upload className="h-4 w-4" />Upload PDF</Button>
                </div>
                <div className="grid gap-2">
                  {suggestedQueries.slice(0, 3).map((q, i) => (
                    <Button key={i} variant="ghost" size="sm" onClick={() => handleSubmit(q)} className="text-xs justify-start h-auto py-2.5 px-3 text-muted-foreground hover:text-foreground">
                      <MessageSquare className="h-3.5 w-3.5 mr-2 flex-shrink-0" /><span className="truncate">{q}</span>
                    </Button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-4 space-y-6">
              <AnimatePresence mode="popLayout">
                {chatLog.map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex gap-3 justify-end">
                      <div className="max-w-[85%] sm:max-w-[75%]">
                        <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground p-3.5"><p className="text-sm whitespace-pre-wrap">{item.message}</p></div>
                        <span className="text-[10px] text-muted-foreground mt-1 block text-right">{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0"><User className="h-4 w-4 text-accent" /></div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Bot className="h-4 w-4 text-primary" /></div>
                      <div className="max-w-[85%] sm:max-w-[75%] min-w-0">
                        {item.response ? (
                          <div className="rounded-2xl rounded-tl-sm bg-secondary/50 border border-border/50 p-3.5">
                            <MarkdownRenderer content={item.response} />
                            {item.isStreaming && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 rounded-full" />}
                            {!item.isStreaming && item.sources.length > 0 && <SourceCitation sources={item.sources} />}
                            {!item.isStreaming && (
                              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50">
                                <Button variant="ghost" size="sm" onClick={() => handleCopy(item.response, item.id)} className="h-7 px-2 text-xs gap-1">
                                  {copiedId === item.id ? <><Check className="h-3 w-3 text-success" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handlePlayVoice(item.response)} className="h-7 px-2 text-xs gap-1">
                                  {isPlaying ? <><Pause className="h-3 w-3" />Stop</> : <><Play className="h-3 w-3" />Listen</>}
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-2xl rounded-tl-sm bg-secondary/50 border border-border/50 p-3.5">
                            <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Thinking...</span></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="px-4 py-2.5 bg-destructive/10 border-t border-destructive/20 text-destructive text-xs text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />{error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-3 sm:p-4 border-t border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
          <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2">
              <div className="flex-1 relative rounded-2xl border border-border bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
                <textarea ref={textareaRef} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Ask about mining regulations..." rows={1} disabled={isSending}
                  className="w-full px-4 py-3 pr-24 rounded-2xl bg-transparent resize-none focus:outline-none text-sm placeholder:text-muted-foreground disabled:opacity-50"
                  style={{ minHeight: '48px', maxHeight: '200px' }} />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => fileInputRef.current?.click()} disabled={isSending} title="Upload PDF"><Upload className="h-4 w-4" /></Button>
                  {isSending ? (
                    <Button type="button" size="icon" variant="destructive" className="h-8 w-8 rounded-xl" onClick={handleStopGeneration} title="Stop">
                      <Square className="h-3.5 w-3.5 fill-current" />
                    </Button>
                  ) : (
                    <Button type="submit" size="icon" className="h-8 w-8 rounded-xl" disabled={!message.trim()}><Send className="h-4 w-4" /></Button>
                  )}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2 hidden sm:block">Enter to send  Shift+Enter for new line</p>
          </form>
        </div>
      </main>
    </div>
  );
}
