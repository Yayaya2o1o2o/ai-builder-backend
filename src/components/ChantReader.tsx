"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Chant } from "@/data/types";
import { LANGUAGES, type LanguageCode, DEITIES, CHANT_TYPES, OCCASIONS } from "@/data/taxonomy";
import { renderInScript } from "@/lib/transliterate";

const FONT_CLASS: Record<LanguageCode, string> = {
  hi: "font-hi",
  en: "font-sans",
  ta: "font-ta",
  te: "font-te",
  kn: "font-kn",
};

const SIZES = ["text-lg sm:text-xl", "text-xl sm:text-2xl", "text-2xl sm:text-3xl"];

function renderLine(hi: string, lang: LanguageCode, en: string): string {
  if (lang === "hi") return hi;
  if (lang === "en") return en;
  return renderInScript(hi, lang);
}

export function ChantReader({ chant }: { chant: Chant }) {
  const [lang, setLang] = useState<LanguageCode>("hi");
  const [sizeIdx, setSizeIdx] = useState(1);
  const [showMeaning, setShowMeaning] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {chant.deity.map((d) => (
            <span key={d} className="rounded-full px-2.5 py-1" style={{ background: "var(--saffron-soft)", color: "var(--maroon)" }}>
              {DEITIES[d].emoji} {DEITIES[d].en}
            </span>
          ))}
          <span className="rounded-full border px-2.5 py-1" style={{ borderColor: "var(--line)" }}>
            {CHANT_TYPES[chant.type].en}
          </span>
          <span className="opacity-50">~{chant.durationMin} min</span>
        </div>

        <h1 className="font-display mt-4 text-3xl font-semibold sm:text-4xl">{chant.title.en}</h1>
        <p className="font-hi mt-1 text-xl opacity-70">{chant.title.hi}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {chant.occasions.map((o) => (
            <span key={o} className="text-xs opacity-50">
              #{OCCASIONS[o].en}
            </span>
          ))}
        </div>
      </motion.div>

      <div
        className="sticky top-[65px] z-10 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-2.5 backdrop-blur-md"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--canvas-raised) 92%, transparent)" }}
      >
        <div className="flex flex-wrap gap-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className="rounded-xl px-3 py-1.5 text-sm font-medium transition-colors"
              style={lang === l.code ? { background: "var(--maroon)", color: "white" } : { color: "var(--ink)" }}
            >
              {l.native}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Smaller text"
            onClick={() => setSizeIdx((i) => Math.max(0, i - 1))}
            className="h-8 w-8 rounded-full border text-sm"
            style={{ borderColor: "var(--line)" }}
          >
            A−
          </button>
          <button
            aria-label="Larger text"
            onClick={() => setSizeIdx((i) => Math.min(SIZES.length - 1, i + 1))}
            className="h-8 w-8 rounded-full border text-base"
            style={{ borderColor: "var(--line)" }}
          >
            A+
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {chant.lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.4) }}
            className={`${FONT_CLASS[lang]} ${SIZES[sizeIdx]} whitespace-pre-line leading-relaxed`}
          >
            {renderLine(line.hi, lang, line.en)}
          </motion.p>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border p-5" style={{ borderColor: "var(--line)", background: "var(--canvas-raised)" }}>
        <button
          onClick={() => setShowMeaning((v) => !v)}
          className="flex w-full items-center justify-between text-left font-medium"
        >
          What does this mean?
          <span className="text-sm opacity-50">{showMeaning ? "Hide" : "Show"}</span>
        </button>
        {showMeaning && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
            <p className="mt-3 text-sm leading-relaxed opacity-80">{chant.meaningEn}</p>
            <p className="mt-3 text-xs opacity-50">{chant.source}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
