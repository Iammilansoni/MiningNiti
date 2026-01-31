'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Book, 
  Code2, 
  Rocket,
  FileText,
  ArrowRight,
  Terminal,
  Zap,
  Search,
  MessageSquare,
  Upload,
  ExternalLink
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section, SectionHeader } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const quickLinks = [
  {
    icon: Rocket,
    title: 'Getting Started',
    description: 'Learn how to use MiningNiti in 5 minutes.',
    href: '#getting-started',
  },
  {
    icon: Code2,
    title: 'API Reference',
    description: 'Integrate MiningNiti into your applications.',
    href: '#api',
  },
  {
    icon: MessageSquare,
    title: 'Chat Interface',
    description: 'How to use the AI chatbot effectively.',
    href: '#chat',
  },
  {
    icon: Upload,
    title: 'Document Upload',
    description: 'Analyze compliance documents with AI.',
    href: '#documents',
  },
];

const apiEndpoints = [
  {
    method: 'POST',
    endpoint: '/api/chat',
    description: 'Send a query to the AI chatbot',
  },
  {
    method: 'POST',
    endpoint: '/api/documents/analyze',
    description: 'Upload and analyze a document',
  },
  {
    method: 'GET',
    endpoint: '/api/regulations/search',
    description: 'Search the regulations database',
  },
  {
    method: 'GET',
    endpoint: '/api/circulars/latest',
    description: 'Get latest CMPDI circulars',
  },
];

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <Section className="pt-32 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 gradient-mesh opacity-30" />
          
          <Container className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="default" className="mb-6">
                <Book className="h-4 w-4 mr-2" />
                Documentation
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Learn to Use{' '}
                <span className="text-gradient">MiningNiti</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Comprehensive documentation to help you get the most out of our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <a href="#getting-started">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#api">
                    API Reference
                    <Code2 className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            </motion.div>
          </Container>
        </Section>

        {/* Quick Links */}
        <Section className="pt-0">
          <Container>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <motion.a
                  key={link.title}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card variant="feature" hover="glow" className="h-full">
                    <CardContent className="p-5">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <link.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </CardContent>
                  </Card>
                </motion.a>
              ))}
            </div>
          </Container>
        </Section>

        {/* Getting Started */}
        <Section id="getting-started" className="bg-card/50">
          <Container>
            <SectionHeader
              badge="Quick Start"
              title="Getting Started"
              subtitle="Get up and running with MiningNiti in just a few steps."
            />

            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  step: 1,
                  title: 'Create an Account',
                  description: 'Sign up for a free account to access the chatbot and basic features.',
                },
                {
                  step: 2,
                  title: 'Start a Conversation',
                  description: 'Navigate to the chat interface and ask your mining compliance question.',
                },
                {
                  step: 3,
                  title: 'Get AI-Powered Answers',
                  description: 'Receive accurate, source-cited answers from our RAG-powered AI.',
                },
                {
                  step: 4,
                  title: 'Explore Features',
                  description: 'Try document analysis, search across multiple sources, and more.',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Chat Interface */}
        <Section id="chat">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Badge variant="default" className="mb-4">Chat Interface</Badge>
                <h2 className="font-display text-3xl font-bold mb-4">
                  Using the AI Chatbot
                </h2>
                <p className="text-muted-foreground mb-6">
                  Our AI chatbot understands natural language queries about mining regulations. 
                  Here are some tips for getting the best results:
                </p>
                <ul className="space-y-3">
                  {[
                    'Be specific about the regulation or topic you need help with',
                    'Ask follow-up questions to dive deeper into topics',
                    'Use the source toggle to search database, web, or both',
                    'Reference specific acts or circulars for precise answers',
                  ].map((tip, index) => (
                    <motion.li
                      key={tip}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
                <Button asChild className="mt-6">
                  <Link href="/chatting">
                    Try the Chatbot
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">You</span>
                    </div>
                    <div className="flex-1 bg-primary/10 rounded-2xl rounded-tl-none p-3">
                      <p className="text-sm">What are the safety requirements for underground coal mines?</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-3">
                      <p className="text-sm text-muted-foreground">
                        According to the Coal Mines Regulations 2017, underground coal mines must comply with...
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="muted" size="sm">3 sources</Badge>
                        <Badge variant="success" size="sm">Verified</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </Section>

        {/* API Reference */}
        <Section id="api" className="bg-card/50">
          <Container>
            <SectionHeader
              badge="Developer"
              title="API Reference"
              subtitle="Integrate MiningNiti into your applications with our REST API."
            />

            <div className="max-w-4xl mx-auto">
              {/* Auth */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <Card variant="default">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5" />
                      Authentication
                    </CardTitle>
                    <CardDescription>
                      All API requests require authentication using a Bearer token.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-background p-4 rounded-lg text-sm overflow-x-auto">
                      <code className="text-muted-foreground">
{`Authorization: Bearer YOUR_API_KEY

# Get your API key from the dashboard
# https://miningniti.com/dashboard/api-keys`}
                      </code>
                    </pre>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Endpoints */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="font-semibold text-lg mb-4">Endpoints</h3>
                <div className="space-y-3">
                  {apiEndpoints.map((endpoint, index) => (
                    <motion.div
                      key={endpoint.endpoint}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card variant="default" className="hover:border-primary/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Badge 
                              variant={endpoint.method === 'POST' ? 'accent' : 'default'}
                              className="font-mono"
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="font-mono text-sm text-primary">{endpoint.endpoint}</code>
                            <span className="text-sm text-muted-foreground ml-auto hidden sm:block">
                              {endpoint.description}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-8"
              >
                <Button variant="outline">
                  View Full API Docs
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section>
          <Container size="md" className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Need Help?
              </h2>
              <p className="text-muted-foreground mb-8">
                Can&apos;t find what you&apos;re looking for? Our team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/contact">
                    Contact Support
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/faq">View FAQ</Link>
                </Button>
              </div>
            </motion.div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
