'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: 'What types of documents does MiningNiti support?',
    a: 'MiningNiti supports over 50 file types out of the box — including scanned PDFs (with OCR), Word documents, Excel sheets, CSV bore logs, images of paper documents, and email archives. Our proprietary parser is specifically trained on the formatting patterns common in mining documentation, including regulatory tables, geological logs, and safety checklists.',
  },
  {
    q: 'Does my data leave our on-premise servers?',
    a: "No. MiningNiti can be deployed in a fully air-gapped, on-premise configuration for operations with strict data residency requirements. We also offer a private cloud deployment on your own AWS or Azure tenant. In either mode, your documents never leave your controlled environment — the AI models run inside your infrastructure boundary.",
  },
  {
    q: 'How does MiningNiti handle DGMS and Indian mining regulations?',
    a: 'MiningNiti ships with a pre-built regulatory knowledge base covering DGMS (Directorate General of Mines Safety) regulations, Mines Act 1952, Coal Mines Regulations 2017, and state-level mining rules. This base is updated quarterly. Our AI reasoning layer cross-references your operational documents against this regulatory graph to surface compliance gaps automatically.',
  },
  {
    q: 'How long does it take to get started?',
    a: "A typical deployment takes 48–72 hours. This includes connecting to your document sources (SharePoint, shared drives, S3 buckets), running the initial indexing pipeline, and configuring your compliance rule set. Your team will be querying documents in natural language within the first week — no training required.",
  },
  {
    q: 'Can MiningNiti integrate with our existing ERP or operations software?',
    a: 'Yes. MiningNiti exposes a REST API and webhook system that integrates natively with SAP, Oracle ERP, Microsoft 365, and any custom internal system. You can push compliance alerts into your ticketing system, trigger document searches from within your operations dashboard, or embed our chat interface directly into your workflow tools.',
  },
  {
    q: 'How accurate is the AI extraction on old or low-quality scans?',
    a: 'Our OCR and semantic parsing pipeline achieves 99.2% accuracy on standard digital PDFs. For low-quality scans (older documents, carbon copies, handwritten annotations), accuracy ranges from 91–96% depending on scan quality. We provide a confidence score on every extraction and flag low-confidence results for manual review, so your team always knows what to trust.',
  },
  {
    q: 'Is MiningNiti suitable for small mining operations or only large enterprises?',
    a: 'MiningNiti is designed to scale in both directions. Small and mid-size operators typically start with our SaaS tier — connecting a few hundred documents in an afternoon. Large enterprise deployments with millions of documents use our dedicated infrastructure tier with SLA-backed uptime. Pricing scales with document volume, not number of users.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-[#05030A] border-t border-white/5 relative overflow-hidden" id="faq">

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_bottom,rgba(148,122,252,0.06),transparent_70%)] pointer-events-none" />

      <div className="mx-auto max-w-[1200px] px-6 relative z-10">
        
        <div className="grid lg:grid-cols-[1fr_1.8fr] gap-16 lg:gap-24 items-start">
          
          {/* Left — Sticky heading */}
          <div className="lg:sticky lg:top-32">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#947AFC] mb-4"
            >
              FAQ
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-white leading-[1.1] mb-6"
            >
              Questions & Answers
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/50 text-[16px] leading-relaxed mb-8"
            >
              Everything you need to know about deploying MiningNiti in your operation.
            </motion.p>
            <motion.a
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              href="mailto:hello@miningniti.com"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#947AFC] hover:text-white transition-colors"
            >
              Still have questions? Contact us
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1 5.5H10M10 5.5L5.5 1M10 5.5L5.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.a>
          </div>

          {/* Right — Accordion */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="divide-y divide-white/[0.07]"
          >
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="py-5">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-start gap-4 text-left group"
                    suppressHydrationWarning
                  >
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        'size-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200',
                        isOpen
                          ? 'border-[#947AFC] bg-[#947AFC]/10'
                          : 'border-white/20 group-hover:border-white/40'
                      )}
                    >
                      <Plus className={cn('size-3 transition-colors duration-200', isOpen ? 'text-[#947AFC]' : 'text-white/50')} />
                    </motion.span>
                    <span className={cn(
                      'text-[15px] font-semibold leading-snug transition-colors duration-200',
                      isOpen ? 'text-white' : 'text-white/70 group-hover:text-white'
                    )}>
                      {faq.q}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pt-4 pl-10 text-[15px] text-white/55 leading-[1.75]">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
