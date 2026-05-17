'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  glowColor?: string;
}

export default function NeonButton({
  variant = 'primary',
  size = 'md',
  children,
  glowColor,
  className,
  ...props
}: NeonButtonProps) {
  const baseClasses = "relative overflow-hidden font-semibold rounded-lg transition-all duration-300 transform-gpu";
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const variantClasses = {
    primary: cn(
      "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
      "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
      "hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]",
      "border border-cyan-400/30"
    ),
    secondary: cn(
      "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
      "hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]",
      "border border-purple-400/30"
    ),
    outline: cn(
      "bg-transparent text-cyan-400 border-2 border-cyan-400/50",
      "shadow-[0_0_15px_rgba(6,182,212,0.2)]",
      "hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]",
      "hover:bg-cyan-400/10"
    )
  };

  const glowStyle = glowColor ? {
    boxShadow: `0 0 20px ${glowColor}30, 0 0 40px ${glowColor}20`,
  } : {};

  return (
    <motion.button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      style={glowStyle}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      {...props}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ 
          x: '100%',
          transition: { duration: 0.6, ease: "easeInOut" }
        }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.button>
  );
}
