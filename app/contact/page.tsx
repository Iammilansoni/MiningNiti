'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send, 
  MessageSquare,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section, SectionHeader } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Send us an email anytime',
    value: 'contact@miningniti.com',
    href: 'mailto:contact@miningniti.com',
  },
  {
    icon: MapPin,
    title: 'Office',
    description: 'Visit our office',
    value: 'CMPDI, Ranchi, Jharkhand, India',
    href: '#',
  },
  {
    icon: Clock,
    title: 'Response Time',
    description: 'We typically respond within',
    value: '24 hours',
    href: '#',
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', company: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
                <MessageSquare className="h-4 w-4 mr-2" />
                Get in Touch
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                We&apos;d Love to{' '}
                <span className="text-gradient">Hear from You</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Have questions about MiningNiti? Want to learn more about our services? 
                Get in touch and we&apos;ll get back to you as soon as possible.
              </p>
            </motion.div>
          </Container>
        </Section>

        {/* Contact Methods */}
        <Section className="pt-0">
          <Container>
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="feature" hover="glow" className="text-center h-full">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <method.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{method.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                      {method.href !== '#' ? (
                        <a 
                          href={method.href}
                          className="text-primary hover:underline font-medium"
                        >
                          {method.value}
                        </a>
                      ) : (
                        <span className="text-primary font-medium">{method.value}</span>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card variant="default" className="overflow-hidden">
                  <CardContent className="p-8">
                    {isSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-success" />
                        </div>
                        <h3 className="font-display text-2xl font-bold mb-2">
                          Message Sent!
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                        </p>
                        <Button onClick={() => setIsSubmitted(false)}>
                          Send Another Message
                        </Button>
                      </motion.div>
                    ) : (
                      <>
                        <div className="text-center mb-8">
                          <h2 className="font-display text-2xl font-bold mb-2">
                            Send Us a Message
                          </h2>
                          <p className="text-muted-foreground">
                            Fill out the form below and we&apos;ll get back to you soon.
                          </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium mb-2">
                                Full Name *
                              </label>
                              <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email Address *
                              </label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="company" className="block text-sm font-medium mb-2">
                                Company
                              </label>
                              <Input
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="Your Company"
                              />
                            </div>
                            <div>
                              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                                Subject *
                              </label>
                              <Input
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="How can we help?"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="message" className="block text-sm font-medium mb-2">
                              Message *
                            </label>
                            <Textarea
                              id="message"
                              name="message"
                              value={formData.message}
                              onChange={handleChange}
                              placeholder="Tell us more about your inquiry..."
                              rows={5}
                              required
                            />
                          </div>

                          <Button 
                            type="submit" 
                            size="lg" 
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Sending...
                              </>
                            ) : (
                              <>
                                Send Message
                                <Send className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </form>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </Container>
        </Section>

        {/* FAQ Link */}
        <Section className="bg-card/50">
          <Container size="md" className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Looking for Quick Answers?
              </h2>
              <p className="text-muted-foreground mb-6">
                Check out our FAQ section for answers to common questions.
              </p>
              <Button asChild variant="outline">
                <a href="/#faq">View FAQ</a>
              </Button>
            </motion.div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
