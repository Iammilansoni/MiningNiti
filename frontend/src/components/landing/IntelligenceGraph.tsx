'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/*
  IntelligenceGraph — Enhanced
  Includes floating data packets, dynamic badges, and complex networking.
*/

interface NodeProps {
  cx: number;
  cy: number;
  label: string;
  sublabel?: string;
  delay: number;
  color?: string;
  size?: number;
  badge?: string;
}

function GraphNode({ cx, cy, label, sublabel, delay, color = '#947AFC', size = 6, badge }: NodeProps) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay + 0.8, duration: 0.8, type: 'spring', bounce: 0.4 }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      {/* Outer ambient glow */}
      <circle cx={cx} cy={cy} r={size + 16} fill={color} opacity="0.04" className="animate-node-pulse" />
      <circle cx={cx} cy={cy} r={size + 6} fill={color} opacity="0.1" />
      
      {/* Node body */}
      <circle cx={cx} cy={cy} r={size} fill="#0A0A0B" stroke={color} strokeWidth="1.5" />
      {/* Inner dot */}
      <circle cx={cx} cy={cy} r={2} fill={color} opacity="0.9" />
      
      {/* Label */}
      <text
        x={cx}
        y={cy + size + 16}
        textAnchor="middle"
        fill="white"
        opacity="0.8"
        fontSize="11"
        fontWeight="500"
        fontFamily="var(--font-sans)"
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={cx}
          y={cy + size + 28}
          textAnchor="middle"
          fill="white"
          opacity="0.4"
          fontSize="9"
          fontFamily="var(--font-mono)"
          letterSpacing="0.05em"
        >
          {sublabel}
        </text>
      )}

      {/* Floating Badge */}
      {badge && (
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 1.2, duration: 0.6 }}
        >
          <rect x={cx + 12} y={cy - 24} width="70" height="18" rx="4" fill="#111113" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" />
          <text x={cx + 47} y={cy - 12} textAnchor="middle" fill={color} fontSize="8" fontWeight="600" fontFamily="var(--font-mono)" letterSpacing="0.02em">
            {badge}
          </text>
        </motion.g>
      )}
    </motion.g>
  );
}

interface ConnectionProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
  color?: string;
  curveOffset?: number;
}

function Connection({ x1, y1, x2, y2, delay, color = '#947AFC', curveOffset = 0 }: ConnectionProps) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + curveOffset;
  const path = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;

  return (
    <g>
      {/* Static faint line */}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: delay + 0.5, duration: 2.0, ease: 'easeInOut' }}
      />
      {/* Animated electric signal line (dashed with wide gap) */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.8"
        strokeDasharray="4 150"
        filter="url(#neon-glow)"
        className="animate-data-flow"
        style={{ animationDelay: `${delay * 0.5}s` }}
      />
    </g>
  );
}

export function IntelligenceGraph() {
  const hub = { x: 400, y: 220 };

  const nodes: (NodeProps & { x: number; y: number })[] = [
    { cx: 120, cy: 120, x: 120, y: 120, label: 'Compliance', sublabel: '2,847 regulations', delay: 0.1, color: '#34D399', badge: 'STATUS: OK' },
    { cx: 680, cy: 120, x: 680, y: 120, label: 'Safety Intel', sublabel: 'Risk score: 94.2', delay: 0.2, color: '#F59E0B', badge: 'ALERT: LOW' },
    { cx: 80, cy: 280, x: 80, y: 280, label: 'Documents', sublabel: '4.2M parsed', delay: 0.3, color: '#4B8BF5' },
    { cx: 720, cy: 280, x: 720, y: 280, label: 'Geological', sublabel: '12 active sites', delay: 0.4, color: '#947AFC' },
    { cx: 240, cy: 380, x: 240, y: 380, label: 'Environmental', sublabel: 'Monitoring live', delay: 0.5, color: '#34D399' },
    { cx: 560, cy: 380, x: 560, y: 380, label: 'Knowledge Graph', sublabel: '1.8M entities', delay: 0.6, color: '#4B8BF5', badge: 'SYNCING...' },
    // Extra nodes for complexity
    { cx: 300, cy: 80, x: 300, y: 80, label: 'Sensors', delay: 0.7, color: '#F59E0B', size: 4 },
    { cx: 500, cy: 80, x: 500, y: 80, label: 'Satellites', delay: 0.8, color: '#4B8BF5', size: 4 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 1.5 }}
      className="relative w-full max-w-[900px] mx-auto"
    >
      <svg
        viewBox="0 0 800 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ filter: 'drop-shadow(0 0 30px rgba(148, 122, 252, 0.05))' }}
      >
        <defs>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Main Connections */}
        {nodes.map((node, i) => (
          <Connection key={`main-${i}`} x1={hub.x} y1={hub.y} x2={node.x} y2={node.y} delay={node.delay} color={node.color} curveOffset={-20} />
        ))}

        {/* Cross-connections */}
        <Connection x1={120} y1={120} x2={80} y2={280} delay={0.9} color="#34D399" curveOffset={20} />
        <Connection x1={680} y1={120} x2={720} y2={280} delay={1.0} color="#F59E0B" curveOffset={20} />
        <Connection x1={80} y1={280} x2={240} y2={380} delay={1.1} color="#4B8BF5" curveOffset={-10} />
        <Connection x1={720} y1={280} x2={560} y2={380} delay={1.2} color="#947AFC" curveOffset={-10} />
        <Connection x1={300} y1={80} x2={120} y2={120} delay={1.3} color="#F59E0B" />
        <Connection x1={500} y1={80} x2={680} y2={120} delay={1.4} color="#4B8BF5" />

        {/* Nodes */}
        {nodes.map((node, i) => (
          <GraphNode key={`node-${i}`} {...node} />
        ))}

        {/* Central Hub */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8, type: 'spring', bounce: 0.5 }}
          style={{ transformOrigin: `${hub.x}px ${hub.y}px` }}
        >
          {/* Glowing rings */}
          <circle cx={hub.x} cy={hub.y} r={60} fill="#947AFC" opacity="0.04" className="animate-node-pulse" />
          <circle cx={hub.x} cy={hub.y} r={45} fill="#947AFC" opacity="0.08" />
          <circle cx={hub.x} cy={hub.y} r={28} fill="#0A0A0B" stroke="#947AFC" strokeWidth="1.5" />
          
          {/* Animated concentric dashed rings */}
          <circle
            cx={hub.x}
            cy={hub.y}
            r={22}
            fill="none"
            stroke="#947AFC"
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.6"
            className="animate-hub-spin"
            style={{ transformOrigin: `${hub.x}px ${hub.y}px` }}
          />
          <circle
            cx={hub.x}
            cy={hub.y}
            r={16}
            fill="none"
            stroke="#4B8BF5"
            strokeWidth="0.5"
            strokeDasharray="2 4"
            opacity="0.8"
            className="animate-hub-spin"
            style={{ transformOrigin: `${hub.x}px ${hub.y}px`, animationDirection: 'reverse', animationDuration: '15s' }}
          />
          
          <circle cx={hub.x} cy={hub.y} r={5} fill="#947AFC" opacity="1" />
          
          <text x={hub.x} y={hub.y + 48} textAnchor="middle" fill="white" opacity="0.95" fontSize="12" fontWeight="600" fontFamily="var(--font-sans)">
            MiningNiti AI
          </text>
          <text x={hub.x} y={hub.y + 62} textAnchor="middle" fill="#947AFC" opacity="0.7" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="0.1em">
            AGENTIC CORE
          </text>
        </motion.g>
      </svg>
    </motion.div>
  );
}
