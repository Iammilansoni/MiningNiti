'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MiningNitiLogo } from '@/components/product/brand';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { isSignedIn } = useUser();
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
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-32px)] max-w-[900px] rounded-full transition-all duration-300',
          scrolled
            ? 'bg-[#1A1A1A]/95 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] border border-white/10'
            : 'bg-[#1C1C1C] shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
        )}
      >
        <div className="flex items-center justify-between px-4 py-2.5">

          {/* Brand */}
          <Link href="/" className="flex items-center shrink-0">
            <MiningNitiLogo className="origin-left" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '#architecture', label: 'Platform' },
              { href: '#features', label: 'Intelligence' },
              { href: '#integrations', label: 'Integrations' },
              { href: '#trust', label: 'Security' },
              { href: '#faq', label: 'FAQ' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-[14px] font-medium text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-white/90 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="h-9 px-4 flex items-center text-[14px] font-medium text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-gray-100 transition-colors"
                >
                  Request a demo
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white/80 hover:text-white p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[80px] left-4 right-4 z-[99] bg-[#1C1C1C]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl p-4 flex flex-col gap-2 md:hidden"
          >
            {[
              { href: '#architecture', label: 'Platform' },
              { href: '#features', label: 'Intelligence' },
              { href: '#integrations', label: 'Integrations' },
              { href: '#trust', label: 'Security' },
              { href: '#faq', label: 'FAQ' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-3 text-[15px] font-medium text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/10 mt-2 pt-3 flex flex-col gap-2">
              {isSignedIn ? (
                <Link href="/dashboard" className="flex items-center justify-center h-11 rounded-full bg-white text-black font-semibold text-[14px]">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/sign-in" className="flex items-center justify-center h-11 rounded-full border border-white/20 text-white font-medium text-[14px] hover:bg-white/10 transition-colors">
                    Sign in
                  </Link>
                  <Link href="/sign-up" className="flex items-center justify-center h-11 rounded-full bg-white text-black font-semibold text-[14px] hover:bg-gray-100 transition-colors">
                    Request a demo
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
