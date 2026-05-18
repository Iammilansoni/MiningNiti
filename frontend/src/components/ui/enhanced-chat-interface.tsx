'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff, 
  Paperclip, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Lightbulb,
  Shield,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
  Brain,
  Zap,
  Download,
  Share2,
  MoreVertical
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  metadata?: {
    context?: string[];
    confidence?: number;
    sources?: string[];
    suggestions?: string[];
    category?: 'safety' | 'compliance' | 'production' | 'maintenance' | 'general';
  };
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType<{ className?: string }>;
  prompt: string;
  category: 'safety' | 'compliance' | 'production' | 'maintenance';
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: '1',
    label: 'Safety Protocol',
    icon: Shield,
    prompt: 'Show me the latest safety protocols for underground mining operations',
    category: 'safety',
    color: 'text-safety-critical bg-safety-critical/10'
  },
  {
    id: '2',
    label: 'Compliance Check',
    icon: FileText,
    prompt: 'Check compliance status for environmental regulations',
    category: 'compliance',
    color: 'text-chart-compliance bg-chart-compliance/10'
  },
  {
    id: '3',
    label: 'Production Report',
    icon: BarChart3,
    prompt: 'Generate daily production summary with key metrics',
    category: 'production',
    color: 'text-chart-production bg-chart-production/10'
  },
  {
    id: '4',
    label: 'Equipment Status',
    icon: Settings,
    prompt: 'Show current equipment status and maintenance schedules',
    category: 'maintenance',
    color: 'text-chart-maintenance bg-chart-maintenance/10'
  },
];

const aiSuggestions = [
  'Analyze safety incidents from last month',
  'Compare production efficiency across sites',
  'Review environmental compliance metrics',
  'Schedule equipment maintenance priorities',
  'Generate cost analysis report',
  'Check regulatory updates'
];

interface EnhancedChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  isLoading?: boolean;
  className?: string;
}

export default function EnhancedChatInterface({ 
  onSendMessage, 
  messages, 
  isLoading = false, 
  className = '' 
}: EnhancedChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  // const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = () => {
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
      setShowQuickActions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputMessage(action.prompt);
    setShowQuickActions(false);
    inputRef.current?.focus();
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'safety': return Shield;
      case 'compliance': return FileText;
      case 'production': return BarChart3;
      case 'maintenance': return Settings;
      default: return Brain;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'safety': return 'text-safety-critical';
      case 'compliance': return 'text-chart-compliance';
      case 'production': return 'text-chart-production';
      case 'maintenance': return 'text-chart-maintenance';
      default: return 'text-mining-primary';
    }
  };

  const formatMessageContent = (content: string) => {
    // Enhanced formatting for mining-specific content
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-mining-gradient-primary rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Mining AI Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Intelligent mining operations support
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
            Online
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Chat
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                Share Session
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && showQuickActions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-foreground">
                  Welcome to Mining AI Assistant
                </h4>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Get instant help with safety protocols, compliance checks, production analysis, 
                  and equipment management. Ask me anything about your mining operations.
                </p>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-xl border border-border hover:border-mining-primary/30 bg-card hover:bg-accent/50 text-left transition-all duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground mb-1">
                            {action.label}
                          </h5>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {action.prompt}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* AI Suggestions */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Popular queries
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {aiSuggestions.slice(0, 4).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage(suggestion)}
                      className="text-xs h-8"
                    >
                      <Lightbulb className="h-3 w-3 mr-1" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((message) => {
              const CategoryIcon = getCategoryIcon(message.metadata?.category);
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex space-x-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'ai' && (
                    <Avatar className="mt-1">
                      <AvatarFallback className="bg-mining-gradient-primary">
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`flex flex-col space-y-2 max-w-[80%] ${
                    message.type === 'user' ? 'items-end' : 'items-start'
                  }`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-mining-gradient-primary text-white'
                          : 'bg-card border border-border'
                      }`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessageContent(message.content)
                        }}
                        className="text-sm leading-relaxed"
                      />
                      
                      {message.metadata?.confidence && (
                        <div className="mt-2 flex items-center space-x-2 text-xs opacity-75">
                          <Zap className="h-3 w-3" />
                          <span>Confidence: {Math.round(message.metadata.confidence * 100)}%</span>
                        </div>
                      )}
                    </div>

                    {/* Message Metadata */}
                    {message.type === 'ai' && message.metadata && (
                      <div className="space-y-2 w-full">
                        {/* Sources */}
                        {message.metadata.sources && message.metadata.sources.length > 0 && (
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span>Sources:</span>
                            <div className="flex space-x-1">
                              {message.metadata.sources.slice(0, 3).map((source, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Category */}
                        {message.metadata.category && (
                          <div className="flex items-center space-x-2 text-xs">
                            <CategoryIcon className={`h-3 w-3 ${getCategoryColor(message.metadata.category)}`} />
                            <span className="capitalize text-muted-foreground">
                              {message.metadata.category}
                            </span>
                          </div>
                        )}

                        {/* Suggestions */}
                        {message.metadata.suggestions && message.metadata.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {message.metadata.suggestions.slice(0, 3).map((suggestion, idx) => (
                              <Button
                                key={idx}
                                variant="ghost"
                                size="sm"
                                onClick={() => setInputMessage(suggestion)}
                                className="text-xs h-7 text-mining-primary hover:text-mining-primary"
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Actions */}
                    <div className="flex items-center space-x-2 opacity-50 hover:opacity-100 transition-opacity">
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopyMessage(message.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy message</TooltipContent>
                      </Tooltip>
                      
                      {message.type === 'ai' && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Helpful</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Not helpful</TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <Avatar className="mt-1">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex space-x-3"
            >
              <Avatar>
                <AvatarFallback className="bg-mining-gradient-primary">
                  <Bot className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((dot) => (
                    <motion.div
                      key={dot}
                      className="w-2 h-2 bg-mining-primary rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: dot * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card/50">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about mining operations, safety, compliance, or equipment..."
              className="min-h-[44px] max-h-32 resize-none pr-12"
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="h-11 px-4 mining-gradient-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Input Suggestions */}
        {inputMessage.length === 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {aiSuggestions.slice(0, 3).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInputMessage(suggestion)}
                className="text-xs h-7 text-muted-foreground hover:text-foreground"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
