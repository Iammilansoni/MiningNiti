'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: "MiningNiti reduced our compliance audit prep time from three weeks to under 48 hours. The ability to instantly query historical geological reports with precise citations is game-changing.",
    name: "Rahul Desai",
    title: "Director of Operations",
    company: "Coal India Ltd.",
    avatar: "R"
  },
  {
    quote: "The semantic parser flawlessly handled our 15-year archive of scanned safety logs. What used to be a massive blind spot for our safety officers is now a highly searchable intelligence graph.",
    name: "Dr. Ananya Sharma",
    title: "Chief Safety Officer",
    company: "CMPDI",
    avatar: "A"
  },
  {
    quote: "Finally, a platform that understands geological terminology out of the box. Our engineers no longer waste hours hunting for cross-references in environmental impact statements.",
    name: "Vikram Singh",
    title: "Lead Geologist",
    company: "Hindustan Zinc",
    avatar: "V"
  },
  {
    quote: "We deployed MiningNiti across 12 remote sites in under a week. The offline capabilities combined with instant compliance verification is exactly what the industry needed.",
    name: "Aditi Verma",
    title: "VP Technology",
    company: "Tata Steel Mining",
    avatar: "A"
  },
  {
    quote: "Our incident response time dropped by 40% now that emergency protocols are instantly queryable in the field. This platform doesn\'t just save time, it saves lives.",
    name: "Rakesh Patel",
    title: "Site Manager",
    company: "Vedanta Resources",
    avatar: "R"
  },
  {
    quote: "The automated gap analysis caught three critical permit discrepancies before our regulatory audit. It paid for itself in a single afternoon.",
    name: "Sanjay Gupta",
    title: "Compliance Director",
    company: "NTPC Mining",
    avatar: "S"
  },
  {
    quote: "Processing 4 million unstructured documents used to be impossible. MiningNiti ingested our entire legacy database over a weekend.",
    name: "Priya Reddy",
    title: "Data Operations Lead",
    company: "NMDC",
    avatar: "P"
  },
  {
    quote: "The citations are the killer feature. Our legal team can instantly verify every AI response directly back to the original scanned permit.",
    name: "Nitin Agarwal",
    title: "General Counsel",
    company: "Adani Enterprises",
    avatar: "N"
  },
  {
    quote: "It\'s like having our chief engineer, safety officer, and compliance director available 24/7 to answer complex operational questions.",
    name: "Arjun Nair",
    title: "Mine Supervisor",
    company: "JSW Steel",
    avatar: "A"
  },
  {
    quote: "A massive leap forward for operational intelligence. The dashboard gives our leadership unprecedented visibility into our compliance posture.",
    name: "Karthik Iyer",
    title: "COO",
    company: "Singareni Collieries",
    avatar: "K"
  }
];

// Split into two rows
const ROW_1 = TESTIMONIALS.slice(0, 5);
const ROW_2 = TESTIMONIALS.slice(5, 10);

function TestimonialCard({ item }: { item: typeof TESTIMONIALS[0] }) {
  return (
    <div className="w-[380px] sm:w-[450px] shrink-0 bg-[#0C0C0C]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-7 hover:-translate-y-2 hover:border-[#947AFC]/50 hover:bg-linear-to-br hover:from-[#110e1a]/90 hover:to-[#0a0812]/90 hover:shadow-[0_10px_40px_-10px_rgba(148,122,252,0.3)] transition-all duration-500 ease-out group relative cursor-default">
      <Quote className="absolute top-7 right-7 size-8 text-white/5 group-hover:text-purple-400 group-hover:drop-shadow-[0_0_10px_rgba(148,122,252,0.4)] transition-all duration-500" />
      
      <div className="flex gap-1 mb-5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="size-3.5 text-purple-400 fill-[#947AFC] group-hover:drop-shadow-[0_0_8px_rgba(148,122,252,0.6)] transition-all duration-500" />
        ))}
      </div>
      
      <p className="text-[15px] sm:text-[16px] text-white/80 group-hover:text-white leading-[1.6] mb-8 font-[450] transition-colors duration-500">
        "{item.quote}"
      </p>
      
      <div className="flex items-center gap-3 mt-auto">
        <div className="size-10 rounded-full bg-purple-400/20 border border-[#947AFC]/30 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0 group-hover:bg-purple-400 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(148,122,252,0.6)] transition-all duration-500">
          {item.avatar}
        </div>
        <div>
          <h4 className="text-[14px] text-white font-semibold leading-tight">{item.name}</h4>
          <p className="text-[12px] text-white/50 group-hover:text-white/70 leading-tight mt-0.5 transition-colors duration-500">{item.title}, <span className="text-white/70 group-hover:text-white transition-colors duration-500">{item.company}</span></p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32 bg-[#05030A] border-y border-white/5 relative overflow-hidden">
      
      <div className="text-center mb-16 relative z-10">
        <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-purple-400 mb-4">
          Customer Success
        </p>
        <h2 className="text-[clamp(2rem,3vw,2.5rem)] font-bold tracking-tight text-white px-6">
          Trusted by the world's largest operators
        </h2>
      </div>

      <div className="relative flex flex-col gap-6">
        
        {/* Left/Right Fade Masks */}
        <div className="absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-[#05030A] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-[#05030A] to-transparent z-10 pointer-events-none" />

        {/* Row 1 — Moving Left */}
        <div className="flex w-max overflow-hidden">
          <motion.div
            animate={{ x: [0, "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex gap-6 pr-6"
          >
            {[...ROW_1, ...ROW_1].map((item, i) => (
              <TestimonialCard key={`r1-${i}`} item={item} />
            ))}
          </motion.div>
        </div>

        {/* Row 2 — Moving Right */}
        <div className="flex w-max overflow-hidden">
          <motion.div
            animate={{ x: ["-50%", 0] }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            className="flex gap-6 pr-6"
          >
            {[...ROW_2, ...ROW_2].map((item, i) => (
              <TestimonialCard key={`r2-${i}`} item={item} />
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}

