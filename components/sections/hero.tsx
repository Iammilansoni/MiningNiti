'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Award, Sparkles, Zap, Clock, MessageSquare, ThumbsUp } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Typewriter } from '@/components/ui/typewriter';
import { stats } from '@/lib/constants';

// Seeded random number generator for consistent values
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate particle data once with deterministic values
const particleData = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  initialX: seededRandom(i * 1) * 100,
  initialY: seededRandom(i * 2) * 100,
  scale: seededRandom(i * 3) * 0.5 + 0.5,
  animateY1: seededRandom(i * 4) * 100,
  animateY2: seededRandom(i * 5) * 100,
  animateX1: seededRandom(i * 6) * 100,
  animateX2: seededRandom(i * 7) * 100,
  duration: seededRandom(i * 8) * 10 + 10,
}));

// Floating particles component - client-safe
function FloatingParticles() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particleData.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          initial={{
            x: `${particle.initialX}%`,
            y: `${particle.initialY}%`,
            scale: particle.scale,
          }}
          animate={{
            y: [`${particle.animateY1}%`, `${particle.animateY2}%`],
            x: [`${particle.animateX1}%`, `${particle.animateX2}%`],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

// Stats icon mapping
const statIcons: Record<string, React.ReactNode> = {
  'Queries Answered': <MessageSquare className="h-4 w-4" />,
  'Uptime': <Zap className="h-4 w-4" />,
  'Response Time': <Clock className="h-4 w-4" />,
  'User Satisfaction': <ThumbsUp className="h-4 w-4" />,
};

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Floating Particles */}
      <FloatingParticles />
      
      {/* Animated Gradient Orbs - Enhanced */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/25 to-blue-500/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.35, 0.15],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-accent/20 to-orange-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"
      />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <Container className="relative z-10">
        <motion.div
          style={{ y, opacity }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* SIH Badge - Enhanced with pulse animation */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 0 0 rgba(255, 159, 10, 0)',
                  '0 0 0 8px rgba(255, 159, 10, 0.1)',
                  '0 0 0 0 rgba(255, 159, 10, 0)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block rounded-full"
            >
              <Badge variant="glass" size="lg" icon={<Award className="h-4 w-4 text-accent" />}>
                <Sparkles className="h-3 w-3 text-accent mr-1" />
                <span className="text-accent font-semibold">SIH 2023 Winner</span>
                <span className="mx-2 text-foreground/40">•</span>
                <span className="text-foreground font-medium">CMPDI Project</span>
              </Badge>
            </motion.div>
          </motion.div>

          {/* Main Headline - Enhanced with typewriter effect */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hero-title mb-6 relative"
          >
            <span className="block mb-2">The Future of</span>
            <Typewriter
              words={[
                'Mining Compliance',
                'Regulatory Intelligence',
                'AI-Powered Insights',
                'Instant Answers',
                'Smart Mining',
              ]}
              typingSpeed={80}
              deletingSpeed={40}
              pauseDuration={2500}
              cursorChar="▌"
            />
            <span className="block mt-2">is Here</span>
          </motion.h1>

          {/* Subheadline - Enhanced */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-subtitle mb-10 max-w-3xl mx-auto"
          >
            AI-powered chatbot available <span className="text-primary font-medium">24/7</span> for mining stakeholders. 
            Get instant answers about rules, acts, and circulars using advanced{' '}
            <span className="text-accent font-medium">RAG technology</span>.
          </motion.p>

          {/* CTA Buttons - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button asChild size="lg" className="group relative overflow-hidden">
                <Link href="/chatting">
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                  <span className="relative flex items-center gap-2">
                    Start Chatting
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button asChild variant="outline" size="lg" className="group backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20">
                <Link href="/about">
                  <Play className="h-4 w-4 mr-1 transition-transform group-hover:scale-110" />
                  Watch Demo
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats - Enhanced with glassmorphism cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pb-24"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="group relative"
              >
                <div className="relative p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Icon */}
                  <div className="relative flex justify-center mb-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      {statIcons[stat.label]}
                    </div>
                  </div>
                  
                  {/* Value */}
                  <div className="relative text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
                    <AnimatedCounter 
                      value={stat.value} 
                      suffix={stat.suffix}
                      decimals={stat.label === 'Uptime' ? 1 : 0}
                    />
                  </div>
                  
                  {/* Label */}
                  <p className="relative text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Container>

      {/* Scroll Indicator - Positioned separately from content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-xs text-muted-foreground/80 uppercase tracking-widest font-medium">
            Scroll to explore
          </span>
          
          {/* Animated Arrow Container */}
          <div className="relative flex flex-col items-center">
            {/* Mouse scroll indicator */}
            <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2 backdrop-blur-sm bg-white/5">
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-1.5 bg-primary rounded-full shadow-lg shadow-primary/50"
              />
            </div>
            
            {/* Animated Down Arrows */}
            <div className="mt-2 flex flex-col items-center">
              <motion.svg
                animate={{ y: [0, 4, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-4 h-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
              <motion.svg
                animate={{ y: [0, 4, 0], opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                className="w-4 h-4 text-primary -mt-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

