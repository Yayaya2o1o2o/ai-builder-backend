"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { DEITIES } from "@/data/taxonomy";
import { CHANTS } from "@/data/chants";
import type { Deity } from "@/data/types";

export function DeityChips() {
  const counts = new Map<Deity, number>();
  for (const c of CHANTS) for (const d of c.deity) counts.set(d, (counts.get(d) ?? 0) + 1);
  const active = (Object.keys(DEITIES) as Deity[]).filter((d) => counts.get(d));

  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {active.map((d, i) => (
        <motion.div
          key={d}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.04, duration: 0.4 }}
        >
          <Link
            href={`/browse/deity/${d}`}
            className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors hover:bg-[var(--saffron-soft)]"
            style={{ borderColor: "var(--line)", background: "var(--canvas-raised)" }}
          >
            <span aria-hidden>{DEITIES[d].emoji}</span>
            {DEITIES[d].en}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
