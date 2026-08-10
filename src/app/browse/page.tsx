import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CHANTS } from "@/data/chants";
import { DEITIES, OCCASIONS, CHANT_TYPES } from "@/data/taxonomy";
import type { Deity, Occasion, ChantType } from "@/data/types";

export const metadata = { title: "Browse — Svaram" };

function countBy<T extends string>(pick: (c: (typeof CHANTS)[number]) => T[]) {
  const m = new Map<T, number>();
  for (const c of CHANTS) for (const v of pick(c)) m.set(v, (m.get(v) ?? 0) + 1);
  return m;
}

export default function BrowsePage() {
  const deityCounts = countBy((c) => c.deity as Deity[]);
  const occasionCounts = countBy((c) => c.occasions as Occasion[]);
  const typeCounts = countBy((c) => [c.type] as ChantType[]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Browse</h1>
        <p className="mt-2 opacity-60">Explore by deity, by type of chant, or by occasion.</p>

        <Section title="By deity">
          {[...deityCounts.entries()].map(([d, n]) => (
            <Tile key={d} href={`/browse/deity/${d}`} emoji={DEITIES[d].emoji} label={DEITIES[d].en} sub={DEITIES[d].hi} count={n} />
          ))}
        </Section>

        <Section title="By type">
          {[...typeCounts.entries()].map(([t, n]) => (
            <Tile key={t} href={`/browse/type/${t}`} emoji="📜" label={CHANT_TYPES[t].en} sub={CHANT_TYPES[t].hi} count={n} />
          ))}
        </Section>

        <Section title="By occasion">
          {[...occasionCounts.entries()].map(([o, n]) => (
            <Tile key={o} href={`/browse/occasion/${o}`} emoji="🪔" label={OCCASIONS[o].en} sub={OCCASIONS[o].hi} count={n} />
          ))}
        </Section>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display mb-4 text-xl font-semibold">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{children}</div>
    </section>
  );
}

function Tile({ href, emoji, label, sub, count }: { href: string; emoji: string; label: string; sub: string; count: number }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: "var(--line)", background: "var(--canvas-raised)" }}
    >
      <span className="text-2xl">{emoji}</span>
      <p className="mt-2 font-medium">{label}</p>
      <p className="font-hi text-sm opacity-60">{sub}</p>
      <p className="mt-1 text-xs opacity-40">
        {count} chant{count === 1 ? "" : "s"}
      </p>
    </Link>
  );
}
