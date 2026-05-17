"use client";

import React from "react";

type MarqueeProps = {
  children: React.ReactNode;
  speed?: number; // seconds for one loop
};

export default function Marquee({ children, speed = 30 }: MarqueeProps) {
  return (
    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div
        className="flex w-max gap-10 will-change-transform animate-marquee"
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {children}
        {children}
        {children}
      </div>
    </div>
  );
}
