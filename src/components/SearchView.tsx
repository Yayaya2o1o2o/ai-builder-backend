"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { searchChants } from "@/lib/search";
import { ChantCard } from "@/components/ChantCard";
import { DEITIES, CHANT_TYPES, OCCASIONS } from "@/data/taxonomy";
import { CHANTS } from "@/data/chants";
import type { Deity, ChantType, Occasion } from "@/data/types";

function useAvailable<T extends string>(pick: (c: (typeof CHANTS)[number]) => T[]) {
  const set = new Set<T>();
  for (const c of CHANTS) for (const v of pick(c)) set.add(v);
  return set;
}

export function SearchView() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [deity, setDeity] = useState<Deity | null>(null);
  const [type, setType] = useState<ChantType | null>(null);
  const [occasion, setOccasion] = useState<Occasion | null>(null);

  const availableDeities = useAvailable((c) => c.deity);
  const availableTypes = useAvailable((c) => [c.type]);
  const availableOccasions = useAvailable((c) => c.occasions);

  const results = useMemo(() => {
    let r = searchChants(query);
    if (deity) r = r.filter((c) => c.deity.includes(deity));
    if (type) r = r.filter((c) => c.type === type);
    if (occasion) r = r.filter((c) => c.occasions.includes(occasion));
    return r;
  }, [query, deity, type, occasion]);

  function updateQuery(v: string) {
    setQuery(v);
    router.replace(`/search?q=${encodeURIComponent(v)}`, { scroll: false });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mx-auto max-w-xl">
        <div
          className="flex items-center rounded-full border px-5 py-3.5 shadow-sm"
          style={{ background: "var(--canvas-raised)", borderColor: "var(--line)" }}
        >
          <svg className="mr-3 h-5 w-5 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Search an aarti, bhajan, god or occasion…"
            className="w-full bg-transparent outline-none placeholder:opacity-50"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
        <FilterGroup label="Deity">
          {[...availableDeities].map((d) => (
            <Chip key={d} active={deity === d} onClick={() => setDeity(deity === d ? null : d)}>
              {DEITIES[d].emoji} {DEITIES[d].en}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Type">
          {[...availableTypes].map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(type === t ? null : t)}>
              {CHANT_TYPES[t].en}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Occasion">
          {[...availableOccasions].map((o) => (
            <Chip key={o} active={occasion === o} onClick={() => setOccasion(occasion === o ? null : o)}>
              {OCCASIONS[o].en}
            </Chip>
          ))}
        </FilterGroup>
      </div>

      <motion.div
        key={results.length + query + (deity ?? "") + (type ?? "") + (occasion ?? "")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="mt-10"
      >
        <p className="mb-4 text-sm opacity-60">
          {results.length} {results.length === 1 ? "result" : "results"}
        </p>
        {results.length === 0 ? (
          <p className="rounded-2xl border p-8 text-center opacity-60" style={{ borderColor: "var(--line)" }}>
            Nothing matched. Try a different word, or clear filters above.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((c, i) => (
              <ChantCard key={c.slug} chant={c} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border px-2.5 py-1.5" style={{ borderColor: "var(--line)" }}>
      <span className="px-1 text-xs font-medium uppercase tracking-wide opacity-50">{label}</span>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-2.5 py-1 text-xs transition-colors sm:text-sm"
      style={
        active
          ? { background: "var(--maroon)", color: "white" }
          : { background: "var(--saffron-soft)", color: "var(--ink)" }
      }
    >
      {children}
    </button>
  );
}
