'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Sparkles, Rocket, Building2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlight: boolean;
  icon: React.ReactNode;
  gradient: string;
  cta: string;
  ctaLink: string;
}

const plans: PricingPlan[] = [
  {
    name: 'Starter',
    price: '$199',
    period: '/month',
    description: 'Essential AI mining intelligence for small operations',
    features: [
      'Up to 5,000 documents',
      'Basic AI assistant',
      '10 team members',
      'Email support',
      'Safety protocol templates',
      'Basic analytics dashboard',
    ],
    highlight: false,
    icon: <Sparkles className="w-6 h-6" />,
    gradient: 'from-slate-500 to-slate-600',
    cta: 'Get Started',
    ctaLink: '/sign-up',
  },
  {
    name: 'Professional',
    price: '$499',
    period: '/month',
    description: 'Advanced AI capabilities for growing mining companies',
    features: [
      'Up to 50,000 documents',
      'Advanced AI with custom training',
      '50 team members',
      'Priority support (4hr response)',
      'Real-time compliance monitoring',
      'Advanced analytics & reports',
      'API access',
      'Custom integrations',
    ],
    highlight: true,
    icon: <Rocket className="w-6 h-6" />,
    gradient: 'from-primary to-emerald-600',
    cta: 'Start Free Trial',
    ctaLink: '/sign-up',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Complete AI mining intelligence platform for large operations',
    features: [
      'Unlimited documents',
      'Custom AI model training',
      'Unlimited team members',
      'Dedicated success manager',
      'Advanced security & SSO',
      'White-label solutions',
      'On-premise deployment',
      '24/7 premium support',
    ],
    highlight: false,
    icon: <Building2 className="w-6 h-6" />,
    gradient: 'from-violet-500 to-purple-600',
    cta: 'Contact Sales',
    ctaLink: '/contact',
  },
];

function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative ${plan.highlight ? 'md:-mt-4 md:mb-4' : ''}`}
    >
      {/* Popular badge */}
      {plan.highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-emerald-500 text-white text-sm font-medium shadow-lg shadow-primary/25">
            <Zap className="w-3 h-3" />
            Most Popular
          </span>
        </div>
      )}

      <div className={`relative h-full overflow-hidden rounded-2xl border ${
        plan.highlight 
          ? 'border-primary/50 shadow-xl shadow-primary/10' 
          : 'border-border/50'
      } bg-card/80 backdrop-blur-sm`}>
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-5`} />
        
        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.gradient} text-white`}>
              {plan.icon}
            </div>
            <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
          </div>

          {/* Price */}
          <div className="mb-4">
            <span className="text-4xl md:text-5xl font-bold text-foreground">
              {plan.price}
            </span>
            {plan.period && (
              <span className="text-muted-foreground">{plan.period}</span>
            )}
          </div>

          <p className="text-muted-foreground mb-6">{plan.description}</p>

          {/* CTA */}
          <Link href={plan.ctaLink}>
            <Button 
              className={`w-full mb-8 ${
                plan.highlight 
                  ? 'bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white shadow-lg shadow-primary/25' 
                  : ''
              }`}
              variant={plan.highlight ? 'default' : 'outline'}
              size="lg"
            >
              {plan.cta}
            </Button>
          </Link>

          {/* Features */}
          <ul className="space-y-3">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className={`p-1 rounded-full bg-gradient-to-br ${plan.gradient} mt-0.5`}>
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-chart-3/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Pricing Plans
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Scale with{' '}
            <span className="text-primary text-glow">Confidence</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your mining operation. Start free, 
            scale seamlessly, unlock the full potential of AI.
          </p>
        </motion.div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Need a custom solution? We&apos;ve got you covered.
          </p>
          <Link href="/contact">
            <Button variant="link" className="text-primary">
              Contact our sales team →
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
