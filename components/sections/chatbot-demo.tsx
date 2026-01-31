'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Sparkles, Bot, User } from 'lucide-react';
import Link from 'next/link';
import { Container, SectionHeader } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const sampleConversation = [
  {
    type: 'user',
    message: 'What are the safety regulations for coal mining in India?',
  },
  {
    type: 'bot',
    message: 'Based on the Coal Mines Regulations 2017 and the Mines Act 1952, key safety requirements include:\n\n• Regular safety inspections every 24 hours\n• Adequate ventilation systems\n• Emergency evacuation procedures\n• Proper training for all personnel\n• Use of certified safety equipment\n\nWould you like more details on any specific regulation?',
  },
];

const suggestedQueries = [
  'What is the process for mining lease renewal?',
  'Environmental clearance requirements',
  'Latest DGMS circulars',
  'Mining safety officer qualifications',
];

export function ChatbotDemo() {
  const [showDemo, setShowDemo] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      
      <Container className="relative z-10">
        <SectionHeader
          badge="Live Demo"
          title="Experience AI-Powered Compliance"
          subtitle="See how MiningNiti answers complex mining compliance queries in seconds."
        />

        {/* Demo Container */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-xl"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">MiningNiti AI</h3>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>
              <Badge variant="success" size="sm">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by RAG
              </Badge>
            </div>

            {/* Chat Messages */}
            <div className="p-6 space-y-6 min-h-[400px] bg-gradient-to-b from-transparent to-card/50">
              <AnimatePresence mode="wait">
                {showDemo ? (
                  sampleConversation.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.5, duration: 0.4 }}
                      className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.type === 'bot' && (
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          msg.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{msg.message}</p>
                      </div>
                      {msg.type === 'user' && (
                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-accent" />
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <MessageSquare className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">
                      See It In Action
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Watch how our AI assistant handles real mining compliance queries with precision.
                    </p>
                    <Button onClick={() => setShowDemo(true)}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start Demo
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Suggested Queries */}
            {showDemo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="p-4 border-t border-border"
              >
                <p className="text-xs text-muted-foreground mb-2">Suggested queries:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQueries.map((query) => (
                    <Badge
                      key={query}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors"
                    >
                      {query}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input Bar */}
            <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
              <div className="flex gap-3">
                <div className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                  Ask about mining regulations...
                </div>
                <Button size="icon" className="h-11 w-11 rounded-xl">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8"
          >
            <Button asChild size="lg">
              <Link href="/chatting">
                Try It Yourself
                <Send className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
