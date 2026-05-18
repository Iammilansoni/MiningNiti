// src/app/(dashboard)/dashboard/chat/page.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import {
  useChatSessions, useCreateChatSession, useChatMessages, useSendMessage,
  useUpdateChatSession, useDeleteChatSession, useDocuments,
} from '@/hooks/useApi';
import type { ChatMessage, ChatSource } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShinyText } from '@/components/reactbits';
import { VoiceInput } from '@/components/ui/voice-input';
import {
  MessageSquare, Plus, Clock, Send, Search, Edit3, Trash2,
  PanelLeftClose, PanelLeft, Sparkles, FileText, ChevronDown,
  Copy, Check,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Markdown message renderer
// ─────────────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
    >
      <div className={`max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isUser
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm'
              : 'bg-card border border-border text-card-foreground rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none [&>*:last-child]:mb-0 [&>*:first-child]:mt-0">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCitations sources={message.sources} />
        )}

        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-muted-foreground opacity-60">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.response_time_ms && (
            <span className="text-xs text-muted-foreground opacity-50">{message.response_time_ms}ms</span>
          )}
          <button onClick={copy} className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity">
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// RAG source citations
// ─────────────────────────────────────────────
function SourceCitations({ sources }: { sources: ChatSource[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="max-w-full">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <FileText className="h-3 w-3" />
        {sources.length} source{sources.length > 1 ? 's' : ''}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-1">
              {sources.map((src, i) => (
                <div key={i} className="rounded-lg border border-border bg-card/50 px-3 py-2 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-foreground line-clamp-1">{src.document_title}</span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {(src.relevance_score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{src.chunk_text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Typing indicator
// ─────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start"
    >
      <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
        <span className="text-sm text-muted-foreground">AI is thinking</span>
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1 h-1 rounded-full bg-muted-foreground"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Time formatter
// ─────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    () => searchParams.get('session')
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  // Optimistic local messages for instant feedback
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const { data: sessions = [], isLoading: sessionsLoading } = useChatSessions();
  const { data: sessionDetail, isLoading: messagesLoading } = useChatMessages(activeSessionId);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _createSession = useCreateChatSession();
  const sendMsg = useSendMessage();
  const updateSession = useUpdateChatSession();
  const deleteSession = useDeleteChatSession();
  const { data: docsData } = useDocuments({ status: 'completed', page_size: 100 });

  // Server messages + local optimistic overlay
  const serverMessages = sessionDetail?.messages ?? [];
  const messages: ChatMessage[] = localMessages.length > 0 ? localMessages : serverMessages;

  // Sync localMessages when server data updates
  useEffect(() => {
    if (sessionDetail?.messages && !sendMsg.isPending) {
      setLocalMessages([]);
    }
  }, [sessionDetail, sendMsg.isPending]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Actions ───

  const selectSession = (id: string) => {
    setActiveSessionId(id);
    setLocalMessages([]);
    setEditingId(null);
    router.push(`/dashboard/chat?session=${id}`);
  };

  const newChat = () => {
    setActiveSessionId(null);
    setLocalMessages([]);
    router.push('/dashboard/chat');
    textareaRef.current?.focus();
  };

  const sendMessage = async () => {
    const content = inputText.trim();
    if (!content || sendMsg.isPending) return;

    // Optimistic update
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
      sources: [],
    };
    setLocalMessages(prev => [...(serverMessages.length > 0 ? serverMessages : prev), tempUserMsg]);
    setInputText('');
    scrollToBottom();

    sendMsg.mutate(
      { content, sessionId: activeSessionId },
      {
        onSuccess: (data) => {
          if (!activeSessionId) {
            setActiveSessionId(data.session_id);
            router.replace(`/dashboard/chat?session=${data.session_id}`);
          }
          setLocalMessages([]);
        },
        onError: (e) => {
          setLocalMessages((prev) => prev.filter(m => m.id !== tempUserMsg.id));
          toast.error('Send failed', { description: e.message });
        },
      }
    );
  };

  const saveEdit = async (sessionId: string) => {
    if (!editingTitle.trim()) return;
    updateSession.mutate(
      { sessionId, title: editingTitle },
      {
        onSuccess: () => { setEditingId(null); toast.success('Session renamed'); },
        onError: (e) => toast.error('Rename failed', { description: e.message }),
      }
    );
  };

  const removeSession = (id: string) => {
    deleteSession.mutate(id, {
      onSuccess: () => {
        if (activeSessionId === id) { setActiveSessionId(null); router.push('/dashboard/chat'); }
        toast.success('Session deleted');
      },
      onError: (e) => toast.error('Delete failed', { description: e.message }),
    });
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-12rem)] gap-4">
        {/* ─── Sidebar ─── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex-shrink-0 overflow-hidden"
            >
              <Card className="h-full flex flex-col border-border bg-card w-72">
                <CardHeader className="border-b border-border pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />Chat History
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" className="h-7 w-7" onClick={newChat}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>New chat</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search sessions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-8 text-sm"
                    />
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-2 space-y-1">
                      {sessionsLoading ? (
                        [...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
                      ) : filteredSessions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          <MessageSquare className="mx-auto h-8 w-8 opacity-30 mb-2" />
                          No sessions yet
                        </div>
                      ) : filteredSessions.map((session, i) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`group rounded-xl p-3 cursor-pointer border transition-all ${
                            activeSessionId === session.id
                              ? 'bg-primary/10 border-primary/30'
                              : 'border-transparent hover:bg-accent/40 hover:border-border'
                          }`}
                          onClick={() => selectSession(session.id)}
                        >
                          {editingId === session.id ? (
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <Input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && saveEdit(session.id)}
                                className="h-6 text-xs px-2"
                                autoFocus
                              />
                              <Button size="sm" className="h-6 text-xs px-2" onClick={() => saveEdit(session.id)}>
                                Save
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-sm font-medium line-clamp-1 flex-1">{session.title}</p>
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-5 w-5"
                                  onClick={() => { setEditingId(session.id); setEditingTitle(session.title); }}>
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive"
                                  onClick={() => removeSession(session.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className="text-xs h-4 px-1.5">
                              {session.message_count} msg
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {timeAgo(session.updated_at)}
                            </span>
                          </div>
                          {session.last_message && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 opacity-70">
                              {session.last_message}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Chat area ─── */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col border-border bg-card overflow-hidden">
            {/* Header */}
            <CardHeader className="border-b border-border py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {activeSession?.title ?? <ShinyText>New Conversation</ShinyText>}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {activeSession
                      ? `${activeSession.message_count} messages · RAG-powered answers`
                      : 'Ask questions about your mining documents'}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                  {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline text-xs">{sidebarOpen ? 'Hide' : 'Show'} History</span>
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messagesLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                          <Skeleton className="h-12 w-60 rounded-2xl" />
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <div className="relative mx-auto h-16 w-16 mb-4">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 animate-pulse" />
                        <MessageSquare className="h-16 w-16 opacity-20" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Start a conversation</h3>
                      <p className="text-sm max-w-xs mx-auto mb-6">
                        Ask anything about your mining documents — safety protocols, equipment specs, regulations.
                      </p>
                      {/* Quick prompts */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          'Summarize safety protocols',
                          'List equipment requirements',
                          'What are the compliance risks?',
                          'Key hazards identified',
                        ].map((q) => (
                          <button
                            key={q}
                            onClick={() => setInputText(q)}
                            className="px-3 py-1.5 rounded-full border border-border text-xs hover:bg-accent transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
                  )}

                  <AnimatePresence>
                    {sendMsg.isPending && <TypingIndicator />}
                  </AnimatePresence>

                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              {/* Input bar */}
              <div className="border-t border-border p-4 flex-shrink-0 bg-card/50 backdrop-blur-sm">
                {/* Document context pills */}
                {docsData?.documents && docsData.documents.length > 0 && (
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Context:</span>
                    {docsData.documents.slice(0, 3).map(d => (
                      <Badge key={d.id} variant="secondary" className="text-xs flex items-center gap-1">
                        <FileText className="h-2.5 w-2.5" />
                        {d.title.slice(0, 20)}{d.title.length > 20 ? '…' : ''}
                      </Badge>
                    ))}
                    {docsData.documents.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{docsData.documents.length - 3} more</Badge>
                    )}
                  </div>
                )}

                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Ask about mining safety, equipment, regulations... (Enter to send)"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="min-h-[60px] max-h-36 resize-none pr-24 bg-background text-sm"
                    disabled={sendMsg.isPending}
                  />
                  <div className="absolute right-2 bottom-2 flex gap-1.5 items-center">
                    <VoiceInput onText={(t) => setInputText(p => p + (p ? ' ' : '') + t)} />
                    <Button
                      onClick={sendMessage}
                      disabled={!inputText.trim() || sendMsg.isPending}
                      size="icon"
                      className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center opacity-60">
                  Powered by Gemini 2.0 Flash · RAG over your document corpus
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}