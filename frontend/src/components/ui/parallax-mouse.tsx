"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  strength?: number; // 0..1
  children: React.ReactNode;
  className?: string;
};

export default function ParallaxMouse({ strength = 0.05, children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let bounds = el.getBoundingClientRect();
    const onResize = () => {
      bounds = el.getBoundingClientRect();
    };

    const onMove = (e: MouseEvent) => {
      const cx = bounds.left + bounds.width / 2;
      const cy = bounds.top + bounds.height / 2;
      const dx = (e.clientX - cx) / (bounds.width / 2);
      const dy = (e.clientY - cy) / (bounds.height / 2);

      for (const layer of Array.from(el.querySelectorAll<HTMLElement>("[data-depth]"))) {
        const depth = Number(layer.dataset.depth || 0);
        const tx = -dx * depth * strength * 100;
        const ty = -dy * depth * strength * 100;
        layer.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [strength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
