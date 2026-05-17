"use client";

import React, { useEffect, useRef } from "react";

export default function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const loop = () => {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      node.style.transform = `translate3d(${x - 150}px, ${y - 150}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-40 hidden md:block opacity-40 mix-blend-screen motion-safe:transition-opacity"
      style={{ width: 300, height: 300 }}
    >
      <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.35)_0%,rgba(59,130,246,0.25)_45%,rgba(139,92,246,0.15)_70%,transparent_80%)] blur-3xl" />
    </div>
  );
}
