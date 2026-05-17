"use client";

import { motion, useScroll } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent"
      style={{
        background:
          "linear-gradient(90deg, rgba(34,211,238,0.8) 0%, rgba(59,130,246,0.8) 50%, rgba(139,92,246,0.8) 100%)",
        transformOrigin: "0% 50%",
        scaleX: scrollYProgress,
      }}
    />
  );
}
