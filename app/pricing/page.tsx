'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Check, 
  X, 
  Zap, 
  Building2, 
  Rocket,
  ArrowRight,
  MessageSquare,
  Shield,
  Clock,
  Users
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, Section } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for exploring MiningNiti',
    price: '₹0',
    period: 'forever',
    icon: Zap,
    features: [
      { text: '50 queries per month', included: true },
      { text: 'Basic mining regulations', included: true },
      { text: 'Email support', included: true },
      { text: 'Document analysis', included: false },
      { text: 'API access', included: false },
      { text: 'Priority support', included: false },
      { text: 'Custom integrations', included: false },
    ],
    cta: 'Get Started Free',
    href: '/chatting',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'For professionals and small teams',
    price: '₹2,999',
    period: 'per month',
    icon: Rocket,
    features: [
      { text: 'Unlimited queries', included: true },
      { text: 'Complete regulations database', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Document analysis (50/month)', included: true },
      { text: 'API access (10k requests)', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom integrations', included: false },
    ],
    cta: 'Start Pro Trial',
    href: '/contact',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 'Custom',
    period: 'contact us',
    icon: Building2,
    features: [
      { text: 'Unlimited everything', included: true },
      { text: 'Complete regulations database', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Unlimited document analysis', included: true },
      { text: 'Unlimited API access', included: true },
      { text: '24/7 phone support', included: true },
      { text: 'Custom integrations', included: true },
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
];

const features = [
  {
    icon: MessageSquare,
    title: 'AI-Powered Responses',
    description: 'Get accurate answers using advanced RAG technology',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security for your data',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Access compliance answers anytime',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share and collaborate with your team',
  },
];

export default function PricingPage() {
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
              <Badge variant="default" className="mb-6">Pricing</Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Simple, Transparent{' '}
                <span className="text-gradient">Pricing</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Choose the plan that fits your needs. Start free and scale as you grow.
              </p>
            </motion.div>
          </Container>
        </Section>

        {/* Pricing Cards */}
        <Section className="pt-0">
          <Container>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge variant="accent" className="shadow-lg">Most Popular</Badge>
                    </div>
                  )}
                  <Card 
                    variant={plan.popular ? 'feature' : 'default'} 
                    className={`h-full ${plan.popular ? 'border-primary/50 shadow-glow-sm' : ''}`}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className={`h-12 w-12 rounded-xl ${plan.popular ? 'bg-primary/20' : 'bg-primary/10'} flex items-center justify-center mx-auto mb-4`}>
                        <plan.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="pt-4">
                        <span className="text-4xl font-display font-bold">{plan.price}</span>
                        <span className="text-muted-foreground ml-2">/{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature.text} className="flex items-center gap-3">
                            {feature.included ? (
                              <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center">
                                <Check className="h-3 w-3 text-success" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                                <X className="h-3 w-3 text-muted-foreground" />
                              </div>
                            )}
                            <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        asChild 
                        className="w-full mt-6" 
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        <Link href={plan.href}>
                          {plan.cta}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Features */}
        <Section className="bg-card/50">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Everything You Need
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                All plans include these core features to help you succeed.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
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
                Have Questions?
              </h2>
              <p className="text-muted-foreground mb-8">
                Contact our team to discuss your specific needs and find the right plan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/contact">
                    Contact Sales
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/chatting">Try Free</Link>
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
