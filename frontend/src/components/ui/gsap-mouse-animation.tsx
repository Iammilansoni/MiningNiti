'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface GSAPMouseAnimationProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export default function GSAPMouseAnimation({ 
  children, 
  className = "",
  intensity = 1
}: GSAPMouseAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const element = elementRef.current;
    
    if (!container || !element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      gsap.to(element, {
        duration: 0.3,
        x: x * 20 * intensity,
        y: y * 20 * intensity,
        rotationX: y * 10 * intensity,
        rotationY: x * 10 * intensity,
        transformPerspective: 1000,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        duration: 0.5,
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        ease: "power2.out"
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return (
    <div ref={containerRef} className={`${className} cursor-pointer`}>
      <div ref={elementRef} className="w-full h-full">
        {children}
      </div>
    </div>
  );
}
