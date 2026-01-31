'use client';

import { motion } from 'framer-motion';
import { Container, SectionHeader } from '@/components/ui/container';
import { techStack } from '@/lib/constants';

// Tech icons as SVG paths for custom rendering
const techIcons: Record<string, React.ReactNode> = {
  nextjs: (
    <svg viewBox="0 0 180 180" fill="none" className="h-full w-full">
      <mask id="mask0" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
        <circle cx="90" cy="90" r="90" fill="white"/>
      </mask>
      <g mask="url(#mask0)">
        <circle cx="90" cy="90" r="87" fill="currentColor" stroke="currentColor" strokeWidth="6"/>
        <path d="M149.508 157.52L69.142 54H54V125.97H66.2v-55.7L139.95 164.39c3.5-2.14 6.84-4.49 10.01-7.03" fill="url(#paint0_linear)"/>
        <rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear)"/>
      </g>
      <defs>
        <linearGradient id="paint0_linear" x1="103" y1="54" x2="127.5" y2="148" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="paint1_linear" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  faiss: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),
  rag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  langchain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full">
      <path d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11"/>
      <path d="M17 15L19 17L23 13" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  dpo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  ),
};

export function TechStack() {
  return (
    <section className="py-24 md:py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent" />
      
      <Container className="relative z-10">
        <SectionHeader
          badge="Technology"
          title="Powered by Cutting-Edge AI"
          subtitle="Built with the latest technologies in artificial intelligence and natural language processing."
        />

        {/* Tech Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300 text-center">
                {/* Icon */}
                <div className="h-16 w-16 mx-auto mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                  {techIcons[tech.icon] || (
                    <div className="h-full w-full rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{tech.name[0]}</span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-display font-semibold text-lg mb-1">{tech.name}</h3>

                {/* Description (shown on hover) */}
                <div className="overflow-hidden">
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    whileHover={{ height: 'auto', opacity: 1 }}
                    className="text-sm text-muted-foreground"
                  >
                    {tech.description}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Tech Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 p-6 md:p-8 rounded-2xl border border-border bg-card/50"
        >
          <div className="grid md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <h4 className="font-display font-semibold text-lg mb-2">Vector Database</h4>
              <p className="text-sm text-muted-foreground">
                FAISS enables lightning-fast similarity search across thousands of mining documents.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-lg mb-2">RAG Pipeline</h4>
              <p className="text-sm text-muted-foreground">
                Retrieval Augmented Generation ensures accurate, contextual responses from verified sources.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-lg mb-2">DPO Training</h4>
              <p className="text-sm text-muted-foreground">
                Direct Preference Optimization fine-tunes responses for mining domain expertise.
              </p>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
