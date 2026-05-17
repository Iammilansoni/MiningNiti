'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import CursorFollower from '@/components/ui/cursor-follower';
import ParallaxMouse from '@/components/ui/parallax-mouse';
import ScrollProgress from '@/components/ui/scroll-progress';
import ParticleBackground from '@/components/ui/particle-background';
import { 
  StatsSection, 
  FeaturesBentoGrid, 
  TestimonialsSection, 
  PricingSection, 
  CTASection, 
  Footer 
} from '@/components/landing';
import { 
  Pickaxe,
  Rocket,
  ArrowRight,
  Play,
  Sparkles,
  Menu,
  Shield,
  Database,
  Users,
  Zap
} from 'lucide-react';

// Dynamically import 3D scene to avoid SSR issues
const HeroMiningScene = dynamic(
  () => import('@/components/ui/hero-mining-scene'),
  { ssr: false, loading: () => <div className="w-full h-full bg-gradient-to-br from-primary/5 to-chart-3/5" /> }
);

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Global effects */}
      <ScrollProgress />
      <CursorFollower />
      <ParticleBackground />
      
      {/* ========================================
          HEADER / NAVIGATION
          ======================================== */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass border-b border-border/50 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-2 sm:gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-gradient-to-r from-primary to-emerald-600 p-2 rounded-xl shadow-lg shadow-primary/25">
                <Pickaxe className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                MiningNiti
              </span>
            </motion.div>
            
            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors relative group"
                  whileHover={{ y: -2 }}
                >
                  {item.label}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-primary to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </motion.a>
              ))}
            </nav>
            
            {/* CTA buttons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <Link href="/sign-in" className="hidden sm:block">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/25"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  <span className="hidden xs:inline">Get Started</span>
                  <span className="xs:hidden">Start</span>
                </Button>
              </Link>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Pickaxe className="h-5 w-5 text-primary" />
              MiningNiti
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <ThemeToggle />
            <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      {/* ========================================
          HERO SECTION
          ======================================== */}
      <section className="relative min-h-[90vh] flex items-center py-20 lg:py-32">
        {/* 3D Background Scene */}
        <div className="absolute inset-0 opacity-70">
          <HeroMiningScene />
        </div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div 
              className="text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Badge className="mb-6 glass border-primary/30 text-primary px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Powered by Advanced AI
                </Badge>
              </motion.div>
              
              {/* Main heading */}
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <span className="text-foreground">The Future of</span>{' '}
                <span className="bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 bg-clip-text text-transparent text-glow">
                  Mining
                </span>
                <br />
                <span className="text-foreground">Intelligence</span>
              </motion.h1>
              
              {/* Subheading */}
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                Transform your mining operations with AI-powered document intelligence. 
                Instant access to safety protocols, equipment manuals, and compliance 
                information through our industry-trained AI assistant.
              </motion.p>
              
              {/* CTA buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-10 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <Link href="/sign-up">
                  <Button 
                    size="lg" 
                    className="group w-full sm:w-auto bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-xl shadow-primary/25 px-8"
                  >
                    <Rocket className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="group w-full sm:w-auto">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </motion.div>
              
              {/* Trust indicators */}
              <motion.div 
                className="flex flex-wrap gap-6 text-muted-foreground justify-center lg:justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <Users className="h-4 w-4" />
                  <span className="text-sm">850+ Companies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <Database className="h-4 w-4" />
                  <span className="text-sm">2.5M+ Documents</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">99.9% Uptime</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right side - Visual element */}
            <motion.div 
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <ParallaxMouse strength={0.05} className="relative">
                {/* Floating cards showcasing features */}
                <div className="space-y-4">
                  {[
                    { icon: <Zap className="w-5 h-5" />, label: 'Instant AI Analysis', value: '< 2 sec' },
                    { icon: <Shield className="w-5 h-5" />, label: 'Safety Score', value: '96%' },
                    { icon: <Database className="w-5 h-5" />, label: 'Documents Indexed', value: '2.5M+' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.2 }}
                      className="glass rounded-xl p-4 border border-border/50 flex items-center gap-4 max-w-xs ml-auto"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="text-lg font-bold text-foreground">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ParallaxMouse>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================
          STATS SECTION
          ======================================== */}
      <StatsSection />

      {/* ========================================
          FEATURES BENTO GRID
          ======================================== */}
      <FeaturesBentoGrid />

      {/* ========================================
          TESTIMONIALS
          ======================================== */}
      <TestimonialsSection />

      {/* ========================================
          PRICING
          ======================================== */}
      <PricingSection />

      {/* ========================================
          CTA SECTION
          ======================================== */}
      <CTASection />

      {/* ========================================
          FOOTER
          ======================================== */}
      <Footer />
    </div>
  );
}