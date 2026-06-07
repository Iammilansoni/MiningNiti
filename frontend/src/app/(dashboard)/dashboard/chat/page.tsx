'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Plus, 
  Search, 
  MessageSquare,
  MoreVertical,
  Paperclip,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useUser } from '@clerk/nextjs';

// Mock data for UI development
const mockSessions = [
  { id: '1', title: 'Q3 Environmental Audit Analysis', date: '2 hours ago' },
  { id: '2', title: 'Safety Protocol v2 Compliance Check', date: 'Yesterday' },
  { id: '3', title: 'Equipment Maintenance Logs', date: '3 days ago' },
  { id: '4', title: 'Sector 7 Geological Survey', date: 'Last week' },
];

const mockMessages = [
  {
    id: '1',
    role: 'user',
    content: 'Can you summarize the key findings from the Q3 Environmental Audit?',
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Based on the Q3 Environmental Audit for Sector 7, here are the key findings:\n\n1. **Water Quality:** Heavy metal concentrations in runoff are 12% below the regulatory limit (compliant).\n2. **Air Particulates:** PM10 levels exceeded the threshold on August 14th due to high winds. Mitigation protocols were successfully deployed.\n3. **Revegetation:** The native flora replanting program in Zone B has achieved a 85% survival rate, exceeding the 70% target.\n\nOverall compliance score for this quarter is **94%**.',
    citations: [
      { id: 'c1', title: 'Q3_Audit.pdf', page: 12 },
      { id: 'c2', title: 'Water_Quality_Log.xlsx', page: 'Sheet 2' }
    ]
  },
  {
    id: '3',
    role: 'user',
    content: 'What mitigation protocols were used for the PM10 exceedance?',
  },
];

export default function ChatPage() {
  const { user } = useUser();
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="flex h-[calc(100vh-var(--header-height)-2rem)] overflow-hidden rounded-xl border border-border bg-card shadow-sm animate-in fade-in duration-500">
      
      {/* ── Sessions Sidebar ── */}
      <div 
        className={cn(
          "flex flex-col border-r border-border bg-muted/20 transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-0 overflow-hidden border-r-0"
        )}
      >
        <div className="p-4 border-b border-border">
          <Button className="w-full justify-start gap-2" variant="outline">
            <Plus className="size-4" />
            New Chat
          </Button>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent
            </div>
            {mockSessions.map((session) => (
              <button 
                key={session.id}
                className="w-full flex flex-col items-start gap-1 p-2 rounded-md hover:bg-accent text-left transition-colors focus-visible:outline-none focus-visible:bg-accent"
              >
                <span className="text-sm font-medium text-foreground truncate w-full">
                  {session.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {session.date}
                </span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex flex-1 flex-col relative bg-background">
        {/* Chat Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <MessageSquare className="size-4" />
            </button>
            <h2 className="text-sm font-medium">Q3 Environmental Audit Analysis</h2>
          </div>
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
            <MoreVertical className="size-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-6 md:px-8" ref={scrollRef}>
          <div className="mx-auto max-w-3xl space-y-8 pb-4">
            {mockMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex gap-4",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-muted border-border"
                )}>
                  {msg.role === 'user' ? (
                     user?.imageUrl ? (
                       <img src={user.imageUrl} alt="User" className="size-8 rounded-full" />
                     ) : (
                       <User className="size-4" />
                     )
                  ) : (
                    <Bot className="size-4 text-foreground" />
                  )}
                </div>
                
                <div className={cn(
                  "flex flex-col gap-2 max-w-[85%]",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-muted text-foreground rounded-tr-sm" 
                      : "bg-transparent p-0"
                  )}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  
                  {/* Citations block for assistant messages */}
                  {msg.citations && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.citations.map(cit => (
                        <div key={cit.id} className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                          <FileText className="size-3" />
                          <span>{cit.title}</span>
                          <span className="opacity-50">· p.{cit.page}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Thinking / Streaming state mock */}
            <div className="flex gap-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border">
                <Bot className="size-4 text-foreground" />
              </div>
              <div className="flex flex-col gap-2 items-start pt-2">
                 <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-full border border-border">
                   <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                   Analyzing environmental data...
                 </div>
              </div>
            </div>
            
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-background">
          <div className="mx-auto max-w-3xl relative">
            <div className="overflow-hidden rounded-xl border border-input bg-muted/10 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-shadow surface-elevated">
              <Textarea
                value={input}
                onChange={handleInput}
                placeholder="Ask about your mining operations, compliance, or reports..."
                className="min-h-[56px] w-full resize-none border-0 bg-transparent px-4 py-4 text-sm focus-visible:ring-0 shadow-none"
                rows={1}
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
                    <Paperclip className="size-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                    Enter to send
                  </span>
                  <Button size="sm" className="h-8 rounded-lg px-3">
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}