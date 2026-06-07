'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Cloud, Database, HardDrive, Share2, Shield, Network } from 'lucide-react';

export function IntegrationGrid() {
  const integrations = [
    { name: 'AWS S3', icon: Cloud, description: 'Securely index your cloud data lakes without moving files.' },
    { name: 'SharePoint', icon: Share2, description: 'Direct sync with enterprise Microsoft environments.' },
    { name: 'Oracle ERP', icon: Database, description: 'Connect operational databases to compliance records.' },
    { name: 'Local Servers', icon: HardDrive, description: 'On-premise connectors for air-gapped environments.' },
    { name: 'Active Directory', icon: Shield, description: 'Enterprise SSO and role-based access control.' },
    { name: 'Webhook API', icon: Network, description: 'Real-time event streaming to your custom software.' },
  ];

  return (
    <section id="integrations" className="py-24 sm:py-32 bg-[#05030A] border-t border-white/5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(148,122,252,0.05)_0%,transparent_60%)] pointer-events-none" />
      
      <div className="mx-auto max-w-[var(--landing-max-width)] px-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-center">
          
          <div className="md:w-1/3 flex flex-col items-start text-left">
            <h2 className="text-[clamp(2rem,3vw,2.5rem)] font-bold tracking-tight mb-4 text-white leading-[1.1]">
              Integrates with your existing infrastructure
            </h2>
            <p className="text-lg text-white/60 mb-8">
              Mining operations run on fragmented legacy systems. We connect them seamlessly.
            </p>
            <a 
              href="#" 
              className="inline-flex items-center gap-2 text-[15px] font-medium text-[#947AFC] hover:text-white transition-colors"
            >
              View all 40+ integrations
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="shrink-0">
                <path d="M1 5.5H10M10 5.5L5.5 1M10 5.5L5.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

          <div className="md:w-2/3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {integrations.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group p-6 rounded-2xl bg-[#0C0C0C] border border-white/10 hover:-translate-y-2 hover:border-[#947AFC]/50 hover:bg-gradient-to-br hover:from-[#110e1a]/90 hover:to-[#0a0812]/90 hover:shadow-[0_10px_40px_-10px_rgba(148,122,252,0.3)] transition-all duration-500 ease-out relative"
              >
                <div className="size-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-[#947AFC]/10 group-hover:border-[#947AFC]/30 transition-colors">
                  <item.icon className="size-5 text-white/60 group-hover:text-[#947AFC] transition-colors" />
                </div>
                <h3 className="font-semibold text-white mb-2">{item.name}</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
