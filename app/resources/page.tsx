'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BookOpen, 
  FileText, 
  Download,
  ExternalLink,
  ArrowRight,
  Newspaper,
  Scale,
  TrendingUp,
  Users
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section, SectionHeader } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const guides = [
  {
    title: 'Mining Compliance 101',
    description: 'A comprehensive introduction to mining regulations in India.',
    icon: BookOpen,
    category: 'Guide',
    readTime: '15 min read',
  },
  {
    title: 'Understanding CMPDI Circulars',
    description: 'How to interpret and apply CMPDI circulars to your operations.',
    icon: FileText,
    category: 'Guide',
    readTime: '10 min read',
  },
  {
    title: 'Environmental Compliance Checklist',
    description: 'Essential environmental compliance requirements for mining operations.',
    icon: Scale,
    category: 'Checklist',
    readTime: '8 min read',
  },
  {
    title: 'Safety Regulations Overview',
    description: 'Complete guide to mine safety regulations and best practices.',
    icon: Users,
    category: 'Guide',
    readTime: '12 min read',
  },
];

const updates = [
  {
    date: 'January 2026',
    title: 'New Mining Safety Guidelines Released',
    description: 'CMPDI has released updated safety guidelines for underground mining operations.',
    type: 'Regulatory Update',
  },
  {
    date: 'December 2025',
    title: 'Environmental Compliance Changes',
    description: 'Updated environmental clearance requirements for new mining projects.',
    type: 'Policy Change',
  },
  {
    date: 'November 2025',
    title: 'Digital Reporting Requirements',
    description: 'New digital submission requirements for monthly compliance reports.',
    type: 'Procedural Update',
  },
];

const caseStudies = [
  {
    company: 'Coal India Limited',
    title: 'Streamlining Compliance with AI',
    description: 'How CIL reduced compliance query resolution time by 80%.',
    result: '80% faster resolution',
  },
  {
    company: 'NMDC Limited',
    title: 'Automated Regulatory Tracking',
    description: 'Implementing automated tracking for regulatory changes.',
    result: '100% compliance rate',
  },
];

export default function ResourcesPage() {
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
                <BookOpen className="h-4 w-4 mr-2" />
                Resources
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Mining Compliance{' '}
                <span className="text-gradient">Resources</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Guides, regulatory updates, and case studies to help you stay compliant.
              </p>
            </motion.div>
          </Container>
        </Section>

        {/* Guides */}
        <Section>
          <Container>
            <SectionHeader
              badge="Learning"
              title="Compliance Guides"
              subtitle="In-depth guides to help you understand mining regulations."
            />

            <div className="grid md:grid-cols-2 gap-6">
              {guides.map((guide, index) => (
                <motion.div
                  key={guide.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="feature" hover="glow" className="h-full cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <guide.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="muted" size="sm">{guide.category}</Badge>
                            <span className="text-xs text-muted-foreground">{guide.readTime}</span>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{guide.title}</h3>
                          <p className="text-sm text-muted-foreground">{guide.description}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Regulatory Updates */}
        <Section className="bg-card/50">
          <Container>
            <SectionHeader
              badge="Updates"
              title="Latest Regulatory Updates"
              subtitle="Stay informed about the latest changes in mining regulations."
            />

            <div className="space-y-4 max-w-3xl mx-auto">
              {updates.map((update, index) => (
                <motion.div
                  key={update.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="default" hover="lift" className="cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Newspaper className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="accent" size="sm">{update.type}</Badge>
                            <span className="text-xs text-muted-foreground">{update.date}</span>
                          </div>
                          <h3 className="font-semibold mb-1">{update.title}</h3>
                          <p className="text-sm text-muted-foreground">{update.description}</p>
                        </div>
                        <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <Button variant="outline">
                View All Updates
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </Container>
        </Section>

        {/* Case Studies */}
        <Section>
          <Container>
            <SectionHeader
              badge="Success Stories"
              title="Case Studies"
              subtitle="See how leading mining companies use MiningNiti."
            />

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {caseStudies.map((study, index) => (
                <motion.div
                  key={study.company}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="default" className="h-full overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">{study.result}</span>
                      </div>
                      <CardTitle>{study.title}</CardTitle>
                      <CardDescription>{study.company}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{study.description}</p>
                      <Button variant="outline" size="sm">
                        Read Case Study
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Downloads */}
        <Section className="bg-gradient-to-br from-primary/10 via-background to-accent/5">
          <Container size="md" className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Download className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Download Our Compliance Toolkit
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Get our comprehensive compliance toolkit with checklists, templates, and guides.
              </p>
              <Button size="lg">
                Download Free Toolkit
                <Download className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
