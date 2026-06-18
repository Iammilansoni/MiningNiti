'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MiningNitiLogo } from '@/components/product/brand';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { href: '#platform', label: 'Platform' },
  { href: '#features', label: 'Intelligence' },
  { href: '#architecture', label: 'Architecture' },
  { href: '#trust', label: 'Security' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-[100] transition-all duration-500',
          scrolled
            ? 'bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/[0.06] py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">

          {/* Brand */}
          <Link href="/" className="flex items-center shrink-0">
            <MiningNitiLogo className="origin-left" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-auto mr-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 text-[13px] font-medium text-white/50 hover:text-white/90 rounded-lg transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              href="/sign-in"
              className="text-[13px] font-medium text-white/50 hover:text-white/90 px-3 py-2 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-white text-[#0A0A0B] text-[13px] font-semibold hover:bg-white/90 transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              Request Access
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white/60 hover:text-white p-1.5 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-[72px] left-4 right-4 z-[99] bg-[#111113]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.06] shadow-2xl p-3 flex flex-col gap-0.5 md:hidden"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-3 text-[15px] font-medium text-white/60 hover:text-white rounded-xl hover:bg-white/[0.04] transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/[0.06] mt-2 pt-3 flex flex-col gap-2 px-1">
              <Link
                href="/sign-in"
                className="flex items-center justify-center h-11 rounded-xl text-white/60 font-medium text-[14px] hover:text-white hover:bg-white/[0.04] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="flex items-center justify-center h-11 rounded-xl bg-white text-[#0A0A0B] font-semibold text-[14px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Request Access
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
