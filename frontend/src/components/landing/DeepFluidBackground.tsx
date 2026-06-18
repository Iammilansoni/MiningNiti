'use client';

import { motion } from 'framer-motion';

export function DeepFluidBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#0A0A0B]">
      
      {/* ── Fluid Mesh Gradients ── */}
      <div className="absolute inset-0 opacity-50 mix-blend-screen">
        {/* Blob 1: Deep Indigo */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full filter blur-[120px] opacity-40 bg-[#31106b] transform origin-bottom-right"
        />
        
        {/* Blob 2: Deep Cyan */}
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full filter blur-[140px] opacity-30 bg-[#08405c] transform origin-bottom-left"
        />
        
        {/* Blob 3: Faint Brand Purple */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.4, 1],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[20%] left-[10%] w-[70vw] h-[70vw] rounded-full filter blur-[160px] opacity-20 bg-[#6d51cd] transform origin-top-right"
        />
      </div>

      {/* ── Premium Film Grain Noise Overlay ── */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-screen"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px'
        }} 
      />

      {/* ── Deep Vignette ── 
          Fades the edges back to pure black to keep the focus central and ensure text readability 
      */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0A0B_80%)] opacity-90" />
      
    </div>
  );
}
