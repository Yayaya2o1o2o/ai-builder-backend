"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { searchChants } from "@/lib/search";
import { DEITIES, CHANT_TYPES } from "@/data/taxonomy";

export function PillSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => (query.trim() ? searchChants(query).slice(0, 6) : []), [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goToSearch() {
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        onSubmit={(e) => {
          e.preventDefault();
          goToSearch();
        }}
        className="relative flex items-center rounded-full border shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow focus-within:shadow-[0_8px_40px_rgba(226,130,58,0.25)]"
        style={{ background: "var(--canvas-raised)", borderColor: "var(--line)" }}
      >
        <svg
          className="ml-5 h-5 w-5 shrink-0 opacity-50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search an aarti, bhajan, god or occasion…"
          className="w-full bg-transparent px-4 py-4 text-base outline-none placeholder:opacity-50 sm:py-5 sm:text-lg"
        />
        <button
          type="submit"
          className="mr-2 shrink-0 rounded-full px-5 py-3 text-sm font-medium text-white transition-transform active:scale-95 sm:mr-3 sm:px-6"
          style={{ background: "var(--maroon)" }}
        >
          Find
        </button>
      </motion.form>

      <AnimatePresence>
        {focused && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-full z-20 mt-3 overflow-hidden rounded-3xl border shadow-xl"
            style={{ background: "var(--canvas-raised)", borderColor: "var(--line)" }}
          >
            {results.length === 0 ? (
              <p className="p-5 text-sm opacity-60">No matches yet — try a deity, occasion, or word from the chant.</p>
            ) : (
              <ul>
                {results.map((c) => (
                  <li key={c.slug}>
                    <a
                      href={`/chant/${c.slug}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[var(--saffron-soft)]"
                    >
                      <span>
                        <span className="block font-medium">{c.title.en}</span>
                        <span className="font-hi block text-sm opacity-60">{c.title.hi}</span>
                      </span>
                      <span className="shrink-0 text-xs opacity-50">
                        {c.deity[0] ? DEITIES[c.deity[0]].emoji : ""} {CHANT_TYPES[c.type].en}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={goToSearch}
              className="block w-full border-t px-5 py-3 text-left text-sm font-medium"
              style={{ borderColor: "var(--line)", color: "var(--maroon)" }}
            >
              See all results for &ldquo;{query}&rdquo; →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
