'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05030A] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 -left-1/4 w-[40rem] h-[40rem] bg-red-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 -right-1/4 w-[35rem] h-[35rem] bg-orange-500/4 rounded-full blur-[100px] animate-pulse [animation-delay:1.5s]" />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_50%_50%,#000_30%,transparent_100%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-md">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-red-500/10 blur-2xl rounded-full" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl border border-red-500/20 bg-red-500/5">
            <AlertTriangle className="w-8 h-8 text-red-400/80" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-white/90 tracking-tight mb-2">
            System Error
          </h1>
          <p className="text-sm text-white/40 leading-relaxed">
            A critical fault occurred in the processing pipeline.
            The incident has been logged for investigation.
          </p>
        </motion.div>

        {/* Error digest */}
        {error.digest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 font-mono text-xs text-white/20"
          >
            Error ID: {error.digest}
          </motion.div>
        )}

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-24 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
        />

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
          <Button
            onClick={() => reset()}
            className="bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-lg shadow-purple-500/20 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </motion.div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-white/5" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-white/5" />
    </div>
  );
}
