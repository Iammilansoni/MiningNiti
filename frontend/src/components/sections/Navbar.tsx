'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { ChevronRight, Menu, X, ShieldAlert, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Platform Core', href: '#platform' },
  { label: 'RAG Architecture', href: '#architecture' },
  { label: 'Integrations Grid', href: '#integrations' },
  { label: 'Security & Trust', href: '#trust' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 20);
  });

  // Simplified logo for OreIQ
  const OreIQLogo = () => (
    <div className="flex items-center gap-2">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black shadow-[0_0_15px_rgba(245,158,11,0.15)]">
        <Cpu className="h-4 w-4 text-amber-500" />
      </div>
      <span className="font-sans text-lg font-bold tracking-tight text-white">
        Ore<span className="text-amber-500">IQ</span>
      </span>
    </div>
  );

  return (
    <header
      className={cn(
        'fixed top-0 z-40 w-full transition-all duration-300',
        isScrolled
          ? 'bg-black/60 backdrop-blur-xl border-b border-white/5 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
          : 'bg-transparent py-5'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="z-50" onClick={() => setIsMobileMenuOpen(false)}>
          <OreIQLogo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs font-semibold uppercase tracking-widest text-white/60 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="text-xs font-semibold uppercase tracking-widest text-white/60 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Button
            asChild
            className="group relative overflow-hidden rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-500 transition-all hover:bg-amber-500 hover:text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
          >
            <Link href="/book-demo" className="flex items-center gap-2 px-5 font-mono text-[11px] font-bold uppercase tracking-wider">
              Book a Demo
              <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="z-50 block p-2 text-white/60 hover:text-white md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-full flex flex-col border-b border-white/10 bg-black/95 px-4 pb-8 pt-4 backdrop-blur-2xl md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="border-b border-white/5 py-4 text-sm font-semibold uppercase tracking-widest text-white/80"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-4">
              <Link
                href="/login"
                className="text-center text-sm font-semibold uppercase tracking-widest text-white/60"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Button
                asChild
                className="w-full border border-amber-500/30 bg-amber-500/10 text-amber-500"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/book-demo">Book a Demo</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
