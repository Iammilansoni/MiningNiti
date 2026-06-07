'use client';

import { Shield, Lock, FileCheck2, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export function TrustSection() {
  const trustSignals = [
    {
      icon: Shield,
      title: 'SOC 2 Type II Certified',
      description: 'Enterprise-grade security controls and regular third-party audits.'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'AES-256 encryption at rest and TLS 1.3 in transit for all document data.'
    },
    {
      icon: FileCheck2,
      title: 'DGMS Compliant',
      description: 'Pre-configured to recognize and audit against the latest Indian mining regulations.'
    },
    {
      icon: Server,
      title: 'Data Residency',
      description: 'Optional on-premise deployment or regional cloud hosting for strict compliance.'
    }
  ];

  return (
    <section className="py-24 bg-background" id="trust">
      <div className="mx-auto max-w-[var(--landing-max-width)] px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-heading-lg mb-4 text-foreground">Enterprise Security by Default</h2>
          <p className="text-body text-lg">
            Your operational data is your competitive advantage. We protect it with banking-grade security infrastructure.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustSignals.map((signal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-6 rounded-xl border border-border bg-muted/20 flex flex-col items-center text-center hover:bg-muted/40 transition-colors"
            >
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <signal.icon className="size-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{signal.title}</h3>
              <p className="text-sm text-muted-foreground">{signal.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
