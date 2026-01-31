'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Bot, 
  Database, 
  Shield, 
  Bell, 
  FileSearch, 
  Search,
  Zap,
  Clock,
  Lock,
  Globe,
  MessageSquare,
  BarChart,
  ArrowRight,
  Check
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section, SectionHeader } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const services = [
  {
    icon: Bot,
    title: 'AI-Powered Chatbot',
    description: 'Get instant answers to your mining compliance queries using our advanced RAG-powered chatbot.',
    features: ['24/7 Availability', 'Natural Language Processing', 'Context-Aware Responses'],
  },
  {
    icon: Database,
    title: 'Mining Rule Database',
    description: 'Access a comprehensive database of mining rules, acts, and circulars from CMPDI.',
    features: ['500+ Documents', 'Regular Updates', 'Easy Search'],
  },
  {
    icon: Shield,
    title: 'Compliance Tracking',
    description: 'Stay on top of regulatory requirements with automated compliance tracking.',
    features: ['Deadline Alerts', 'Requirement Checklists', 'Audit Trail'],
  },
  {
    icon: FileSearch,
    title: 'Document Analysis',
    description: 'Upload PDFs and get AI-powered analysis of compliance documents.',
    features: ['PDF Extraction', 'Key Point Summary', 'Compliance Check'],
  },
  {
    icon: Bell,
    title: 'Real-time Updates',
    description: 'Receive instant notifications about new circulars and regulatory changes.',
    features: ['Push Notifications', 'Email Alerts', 'Custom Preferences'],
  },
  {
    icon: Search,
    title: 'Multi-source Search',
    description: 'Search across our database, internet, or both for comprehensive answers.',
    features: ['Database Search', 'Web Search', 'Combined Results'],
  },
];

const useCases = [
  {
    title: 'Mining Companies',
    description: 'Ensure compliance with all mining regulations and avoid penalties.',
    icon: Globe,
  },
  {
    title: 'Compliance Officers',
    description: 'Quickly find answers to regulatory questions and stay updated.',
    icon: Shield,
  },
  {
    title: 'Government Officials',
    description: 'Access mining regulations and circulars for reference and enforcement.',
    icon: BarChart,
  },
  {
    title: 'Legal Teams',
    description: 'Research mining laws and regulations for legal proceedings.',
    icon: FileSearch,
  },
];

const benefits = [
  { icon: Zap, text: 'Instant Answers' },
  { icon: Clock, text: '24/7 Availability' },
  { icon: Lock, text: 'Secure & Private' },
  { icon: MessageSquare, text: 'Natural Language' },
];

export default function ServicesPage() {
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
              <Badge variant="default" className="mb-6">Our Services</Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Everything You Need for{' '}
                <span className="text-gradient">Mining Compliance</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Comprehensive AI-powered tools to help you navigate the complex 
                landscape of mining regulations with ease.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <benefit.icon className="h-4 w-4 text-primary" />
                    {benefit.text}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Container>
        </Section>

        {/* Services Grid */}
        <Section>
          <Container>
            <SectionHeader
              badge="Features"
              title="Powerful Features for Compliance"
              subtitle="Our comprehensive suite of tools to streamline your mining compliance workflow."
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="feature" hover="glow" className="h-full">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Use Cases */}
        <Section className="bg-card/50">
          <Container>
            <SectionHeader
              badge="Use Cases"
              title="Who Benefits from MiningNiti"
              subtitle="Our platform serves a wide range of stakeholders in the mining industry."
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={useCase.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <useCase.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Integration Section */}
        <Section>
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Badge variant="default" className="mb-4">Integration</Badge>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  Seamless Integration with Your Workflow
                </h2>
                <p className="text-muted-foreground mb-6">
                  MiningNiti is designed to fit seamlessly into your existing workflow. 
                  Access our services through web, API, or integrate with your existing systems.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    'RESTful API for custom integrations',
                    'Web-based interface for easy access',
                    'PDF document upload and analysis',
                    'Multi-source search capabilities',
                  ].map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center">
                        <Check className="h-4 w-4 text-success" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <Button asChild>
                  <Link href="/contact">
                    Contact for Integration
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="rounded-2xl border border-border bg-card p-6 font-mono text-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-destructive" />
                    <div className="h-3 w-3 rounded-full bg-accent" />
                    <div className="h-3 w-3 rounded-full bg-success" />
                  </div>
                  <pre className="text-muted-foreground overflow-x-auto">
{`// Example API Request
const response = await fetch(
  'https://api.miningniti.com/chat',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      query: 'Mining safety regulations',
      source: 'both'
    })
  }
);

const data = await response.json();
console.log(data.response);`}
                  </pre>
                </div>
              </motion.div>
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section className="bg-gradient-to-br from-primary/10 via-background to-accent/5">
          <Container size="md" className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Experience the power of AI-driven mining compliance. 
                Start chatting with MiningNiti today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/chatting">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/contact">Contact Sales</Link>
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
