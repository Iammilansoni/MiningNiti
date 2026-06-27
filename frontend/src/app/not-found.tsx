'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Search, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05030A] overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 -left-1/4 w-[40rem] h-[40rem] bg-purple-500/6 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 -right-1/4 w-[35rem] h-[35rem] bg-blue-500/4 rounded-full blur-[100px] animate-pulse [animation-delay:1.5s]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_50%_50%,#000_30%,transparent_100%)]" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -100, 100],
              x: [null, Math.random() * 100 - 50, Math.random() * -100 + 50],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative"
        >
          <div className="absolute inset-0 bg-purple-500/10 blur-2xl rounded-full" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl border border-white/10 bg-white/5">
            <FileQuestion className="w-8 h-8 text-purple-400/80" />
          </div>
        </motion.div>

        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-[8rem] md:text-[10rem] font-bold leading-none tracking-tighter">
            <span className="bg-gradient-to-b from-white/20 via-white/10 to-transparent bg-clip-text text-transparent">
              4
            </span>
            <span className="bg-gradient-to-b from-purple-400/40 via-purple-400/20 to-transparent bg-clip-text text-transparent">
              0
            </span>
            <span className="bg-gradient-to-b from-white/20 via-white/10 to-transparent bg-clip-text text-transparent">
              4
            </span>
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center gap-3 max-w-md"
        >
          <h2 className="text-xl font-semibold text-white/90 tracking-tight">
            Page Not Found
          </h2>
          <p className="text-sm text-white/40 leading-relaxed">
            The seam you are looking for has been exhausted or never existed.
            Let us guide you back to productive ground.
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-24 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
        />

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-lg shadow-purple-500/20 transition-all duration-300"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </Button>
        </motion.div>

        {/* Helpful links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-4"
        >
          {[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/documents', label: 'Documents' },
            { href: '/chat', label: 'AI Chat' },
            { href: '/analytics', label: 'Analytics' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-white/25 hover:text-purple-400/70 transition-colors duration-300 font-mono"
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-white/5" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-white/5" />
    </div>
  );
}
