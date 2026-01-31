'use client';

import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Monitor, 
  MessageSquare, 
  FileSearch, 
  Shield, 
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Container, SectionHeader } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const productFeatures = [
  {
    icon: MessageSquare,
    title: 'Intelligent Conversations',
    description: 'Natural language processing for human-like interactions about mining regulations.',
  },
  {
    icon: FileSearch,
    title: 'Document Intelligence',
    description: 'Upload and analyze compliance documents with AI-powered insights.',
  },
  {
    icon: Shield,
    title: 'Regulatory Coverage',
    description: 'Complete coverage of mining acts, rules, and circulars from CMPDI.',
  },
  {
    icon: Zap,
    title: 'Instant Responses',
    description: 'Get accurate answers in seconds with our advanced RAG technology.',
  },
];

const capabilities = [
  'Real-time compliance updates',
  'Multi-source knowledge base',
  'Context-aware responses',
  'Document analysis & extraction',
  'Citation with source references',
  '24/7 availability',
];

export function ProductShowcase() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl"
      />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Product Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Main Device Frame */}
            <div className="relative mx-auto max-w-md">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 blur-3xl rounded-3xl transform scale-90" />
              
              {/* Browser Window Mockup */}
              <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-black/20 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white/5 rounded-lg py-1.5 px-3 text-xs text-muted-foreground text-center">
                      miningniti.com/chat
                    </div>
                  </div>
                </div>
                
                {/* Chat Interface Mock */}
                <div className="p-6 space-y-4 min-h-[400px]">
                  {/* AI Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-4 border border-white/5">
                      <p className="text-sm text-foreground/90">
                        Hello! I&apos;m MiningNiti, your AI assistant for mining compliance. How can I help you today?
                      </p>
                    </div>
                  </motion.div>

                  {/* User Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-3 justify-end"
                  >
                    <div className="bg-primary/20 rounded-2xl rounded-tr-none p-4 border border-primary/20 max-w-[80%]">
                      <p className="text-sm text-foreground/90">
                        What are the latest amendments in mining regulations?
                      </p>
                    </div>
                  </motion.div>

                  {/* AI Response */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-4 border border-white/5">
                      <p className="text-sm text-foreground/90">
                        Based on the latest CMPDI circulars, here are the key amendments...
                      </p>
                      <div className="mt-3 flex gap-2">
                        <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">3 sources</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Verified</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Typing Indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 border border-white/5">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-8 top-20 bg-card/90 backdrop-blur-xl rounded-xl border border-white/10 p-3 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">99.9% Accurate</p>
                    <p className="text-[10px] text-muted-foreground">RAG Powered</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-8 bottom-32 bg-card/90 backdrop-blur-xl rounded-xl border border-white/10 p-3 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileSearch className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">1000+ Documents</p>
                    <p className="text-[10px] text-muted-foreground">Indexed</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
              >
                <Monitor className="h-4 w-4" />
                Product Overview
              </motion.div>
              
              <h2 className="font-display text-display-lg font-bold tracking-tight mb-4">
                Experience the{' '}
                <span className="text-gradient">Future of Mining</span>{' '}
                Compliance
              </h2>
              
              <p className="text-body-md text-muted-foreground">
                MiningNiti combines cutting-edge AI with comprehensive regulatory knowledge 
                to deliver instant, accurate compliance guidance for the mining industry.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {productFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Capabilities List */}
            <div className="grid grid-cols-2 gap-3">
              {capabilities.map((capability, index) => (
                <motion.div
                  key={capability}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{capability}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild size="lg" className="group">
                <Link href="/chatting">
                  Try It Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/services">
                  Learn More
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
