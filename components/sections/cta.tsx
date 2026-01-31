'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
      
      {/* Animated Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 bg-accent/15 rounded-full blur-3xl"
      />

      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6"
          >
            <Sparkles className="h-8 w-8 text-primary" />
          </motion.div>

          {/* Headline */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Ready to Transform Your{' '}
            <span className="text-gradient">Mining Compliance?</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the future of mining compliance with AI-powered assistance. 
            Get instant answers, stay updated, and ensure regulatory compliance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="group">
              <Link href="/chatting">
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              24/7 support
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              SIH 2023 Winner
            </span>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
