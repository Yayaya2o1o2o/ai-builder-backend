"use client";

import { motion } from "framer-motion";

const PETALS = ["🪔", "🌺", "🕉️", "🪷", "✨"];

export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="diya-glow absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2" />
      {PETALS.map((p, i) => (
        <motion.span
          key={i}
          className="animate-drift absolute select-none text-3xl opacity-20 sm:text-4xl"
          style={{
            left: `${12 + i * 18}%`,
            top: `${10 + (i % 3) * 22}%`,
            animationDelay: `${i * 0.8}s`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.18 }}
          transition={{ duration: 1.2, delay: i * 0.15 }}
        >
          {p}
        </motion.span>
      ))}
    </div>
  );
}
