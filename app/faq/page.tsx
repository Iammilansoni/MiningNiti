'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  HelpCircle, 
  ChevronDown,
  ArrowRight,
  MessageSquare,
  Search
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const faqCategories = [
  {
    name: 'General',
    questions: [
      {
        question: 'What is MiningNiti?',
        answer: 'MiningNiti is an AI-powered platform designed to assist stakeholders in the mining industry. It provides 24/7 support through an intelligent chatbot that can answer queries related to mining rules, acts, and circulars. Built as the winning solution for SIH 2023 for CMPDI.',
      },
      {
        question: 'How does MiningNiti work?',
        answer: 'MiningNiti uses advanced AI technologies including RAG (Retrieval Augmented Generation), FAISS vector databases, and LangChain to understand your questions and find accurate answers from our comprehensive database of mining regulations and circulars.',
      },
      {
        question: 'Is MiningNiti available 24/7?',
        answer: 'Yes! Our AI chatbot is available around the clock, 365 days a year. You can ask questions and get instant answers at any time, day or night.',
      },
      {
        question: 'What makes MiningNiti different from other solutions?',
        answer: 'MiningNiti is specifically designed for Indian mining regulations with a focus on CMPDI circulars. Our AI is trained on comprehensive mining regulations and uses advanced technologies like RAG and DPO to provide accurate, context-aware responses.',
      },
    ],
  },
  {
    name: 'Features',
    questions: [
      {
        question: 'What types of questions can I ask?',
        answer: 'You can ask about mining rules, regulations, acts, circulars, safety requirements, environmental compliance, permit requirements, and any other mining-related compliance questions. Our AI understands natural language, so just ask as you would ask a human expert.',
      },
      {
        question: 'Can I upload documents for analysis?',
        answer: 'Yes! With our Pro and Enterprise plans, you can upload PDF documents for AI-powered analysis. Our system will extract key information and help you understand compliance requirements.',
      },
      {
        question: 'Does MiningNiti search the internet too?',
        answer: 'Yes, our multi-source search feature allows you to search our database only, the internet only, or both. This gives you comprehensive answers with the latest information available.',
      },
      {
        question: 'How accurate are the answers?',
        answer: 'Our AI achieves 99.9% accuracy by using RAG technology to retrieve information directly from official documents. All answers include source citations so you can verify the information.',
      },
    ],
  },
  {
    name: 'Pricing & Plans',
    questions: [
      {
        question: 'Is there a free plan?',
        answer: 'Yes! We offer a free plan that includes 50 queries per month, access to basic mining regulations, and email support. It\'s perfect for exploring the platform before committing.',
      },
      {
        question: 'What\'s included in the Pro plan?',
        answer: 'The Pro plan includes unlimited queries, complete regulations database access, priority email support, document analysis (50/month), API access (10k requests), and priority support. It costs ₹2,999/month.',
      },
      {
        question: 'Do you offer enterprise pricing?',
        answer: 'Yes! Our Enterprise plan includes unlimited everything, a dedicated account manager, unlimited document analysis, unlimited API access, 24/7 phone support, and custom integrations. Contact us for custom pricing.',
      },
      {
        question: 'Can I cancel my subscription?',
        answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.',
      },
    ],
  },
  {
    name: 'Security & Privacy',
    questions: [
      {
        question: 'Is my data secure?',
        answer: 'Absolutely. We use enterprise-grade security measures including encryption at rest and in transit, secure authentication, and regular security audits. Your data is never shared with third parties.',
      },
      {
        question: 'Are my queries stored?',
        answer: 'We store query history to improve your experience and help you reference past conversations. You can request deletion of your data at any time in compliance with privacy regulations.',
      },
      {
        question: 'Is MiningNiti compliant with data protection laws?',
        answer: 'Yes, we comply with applicable data protection regulations. Our platform is designed with privacy in mind, and we follow best practices for data handling and security.',
      },
    ],
  },
  {
    name: 'Technical',
    questions: [
      {
        question: 'Do you have an API?',
        answer: 'Yes! Our REST API allows you to integrate MiningNiti into your own applications. API access is available with Pro and Enterprise plans. Full documentation is available in our Docs section.',
      },
      {
        question: 'What browsers are supported?',
        answer: 'MiningNiti works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience.',
      },
      {
        question: 'Can I integrate MiningNiti with my existing systems?',
        answer: 'Yes! Enterprise customers can get custom integrations with their existing compliance management systems, document management systems, and other enterprise software.',
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <span className="font-medium pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-muted-foreground">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('General');

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

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
                <HelpCircle className="h-4 w-4 mr-2" />
                Support
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Frequently Asked{' '}
                <span className="text-gradient">Questions</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Find answers to common questions about MiningNiti.
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12"
                />
              </div>
            </motion.div>
          </Container>
        </Section>

        {/* FAQ Content */}
        <Section className="pt-0">
          <Container>
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Category Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="sticky top-24 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground mb-4">Categories</p>
                  {faqCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setActiveCategory(category.name)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeCategory === category.name
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-white/5'
                      }`}
                    >
                      {category.name}
                      <span className="ml-2 text-xs opacity-60">
                        ({category.questions.length})
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Questions */}
              <div className="lg:col-span-3 space-y-8">
                {(searchQuery ? filteredCategories : faqCategories.filter(c => c.name === activeCategory)).map((category) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {searchQuery && (
                      <h2 className="font-semibold text-lg mb-4">{category.name}</h2>
                    )}
                    <div className="space-y-3">
                      {category.questions.map((item) => (
                        <FAQItem
                          key={item.question}
                          question={item.question}
                          answer={item.answer}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}

                {searchQuery && filteredCategories.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                      Try a different search term or browse categories.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section className="bg-card/50">
          <Container size="md" className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Still Have Questions?
              </h2>
              <p className="text-muted-foreground mb-8">
                Can&apos;t find the answer you&apos;re looking for? Our team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/contact">
                    Contact Support
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/chatting">Ask the AI</Link>
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
