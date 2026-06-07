'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

export function Starfield({ className }: { className?: string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stars = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      animationDelay: `${Math.random() * 4}s`,
    }));
  }, [isMounted]);

  const shootingStars = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 80 + 10}%`,
      y: `${Math.random() * 40}%`,
      angle: `${Math.random() * 20 + 10}deg`,
      len: `${Math.random() * 100 + 50}px`,
      duration: `${Math.random() * 1 + 1}s`,
      delay: `${Math.random() * 15 + i * 2}s`,
      dx: `${Math.random() * 300 + 200}px`,
      dy: `${Math.random() * 100 + 100}px`,
    }));
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 10%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.80) 65%, #000 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 10%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.80) 65%, #000 100%)'
        }}
      >
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {stars.map((star) => (
            <circle
              key={star.id}
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.r}
              fill="#ffffff"
              opacity={star.opacity}
              style={{
                animation: `testiStarTwinkle 4s ease-in-out infinite`,
                animationDelay: star.animationDelay,
              }}
            />
          ))}
        </svg>

        <div className="absolute inset-0">
          {shootingStars.map((star) => (
            <div
              key={star.id}
              className="absolute h-[1.5px] rounded-full"
              style={{
                left: star.x,
                top: star.y,
                width: star.len,
                transform: `rotate(${star.angle})`,
                transformOrigin: 'right center',
                background: 'linear-gradient(to left, #ffffff 0%, rgba(232, 223, 255, 0.85) 18%, rgba(190, 180, 255, 0.45) 55%, transparent 100%)',
                opacity: 0,
                filter: 'drop-shadow(0 0 4px rgba(190, 180, 255, 0.75))',
                animation: `shootingStarFly ${star.duration} cubic-bezier(0.22, 0.61, 0.36, 1) infinite`,
                animationDelay: star.delay,
                //@ts-ignore
                '--dx': star.dx,
                '--dy': star.dy,
              }}
            >
              <div 
                className="absolute right-[-2px] top-1/2 w-[4px] h-[4px] rounded-full bg-white -translate-y-1/2"
                style={{
                  boxShadow: '0 0 8px 1px rgba(232, 223, 255, 0.9), 0 0 16px 3px rgba(148, 122, 252, 0.55)'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
