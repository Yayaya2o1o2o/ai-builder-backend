import Link from "next/link";
import type { Chant } from "@/data/types";
import { DEITIES, CHANT_TYPES } from "@/data/taxonomy";

export function ChantCard({ chant, index = 0 }: { chant: Chant; index?: number }) {
  return (
    <Link
      href={`/chant/${chant.slug}`}
      className="group block rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
      style={{
        borderColor: "var(--line)",
        background: "var(--canvas-raised)",
        animationDelay: `${index * 40}ms`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-semibold">{chant.title.en}</p>
          <p className="font-hi mt-0.5 text-base opacity-70">{chant.title.hi}</p>
        </div>
        <span className="shrink-0 text-2xl" aria-hidden>
          {chant.deity[0] ? DEITIES[chant.deity[0]].emoji : "🕉️"}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm opacity-70">{chant.meaningEn}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span
          className="rounded-full px-2.5 py-1 font-medium"
          style={{ background: "var(--saffron-soft)", color: "var(--maroon)" }}
        >
          {CHANT_TYPES[chant.type].en}
        </span>
        <span className="opacity-50">~{chant.durationMin} min</span>
        <span
          className="ml-auto font-medium opacity-0 transition-opacity group-hover:opacity-100"
          style={{ color: "var(--maroon)" }}
        >
          Sing / chant →
        </span>
      </div>
    </Link>
  );
}
