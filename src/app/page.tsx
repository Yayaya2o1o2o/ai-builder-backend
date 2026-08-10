import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { PillSearch } from "@/components/PillSearch";
import { DeityChips } from "@/components/DeityChips";
import { ChantCard } from "@/components/ChantCard";
import { CHANTS } from "@/data/chants";
import { OCCASIONS } from "@/data/taxonomy";
import Link from "next/link";

const FEATURED_SLUGS = [
  "hanuman-chalisa",
  "om-jai-jagdish-hare",
  "gayatri-mantra",
  "jai-ambe-gauri",
  "om-jai-shiv-omkara",
  "mahamrityunjaya-mantra",
];

export default function Home() {
  const featured = FEATURED_SLUGS.map((s) => CHANTS.find((c) => c.slug === s)).filter((c) => c !== undefined);

  const occasionCounts = new Map<string, number>();
  for (const c of CHANTS) for (const o of c.occasions) occasionCounts.set(o, (occasionCounts.get(o) ?? 0) + 1);
  const activeOccasions = (Object.keys(OCCASIONS) as (keyof typeof OCCASIONS)[]).filter((o) => occasionCounts.get(o));

  return (
    <>
      <Header />
      <main>
        <section className="relative flex flex-col items-center px-5 pb-20 pt-16 text-center sm:pt-24">
          <HeroBackdrop />
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] opacity-60">
            चालीसा · मंत्र · आरती · भजन · स्तोत्र
          </p>
          <h1 className="font-display max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Find any chant. <br />
            <span style={{ color: "var(--maroon)" }}>Sing it in your own words.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance opacity-70 sm:text-lg">
            A calm, searchable home for Hindu aartis, bhajans, chalisas and mantras — by deity, by occasion, in
            Hindi, English, Tamil, Telugu and Kannada.
          </p>
          <div className="mt-9 w-full">
            <PillSearch />
          </div>
          <div className="mt-8 w-full">
            <DeityChips />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14">
          <div className="mb-7 flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Widely chanted</h2>
            <Link href="/browse" className="text-sm font-medium" style={{ color: "var(--maroon)" }}>
              Browse all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c, i) => (
              <ChantCard key={c.slug} chant={c} index={i} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="font-display mb-7 text-2xl font-semibold sm:text-3xl">By occasion</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {activeOccasions.map((o) => (
              <Link
                key={o}
                href={`/browse/occasion/${o}`}
                className="rounded-2xl border p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: "var(--line)", background: "var(--canvas-raised)" }}
              >
                <p className="font-medium">{OCCASIONS[o].en}</p>
                <p className="font-hi mt-1 text-sm opacity-60">{OCCASIONS[o].hi}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
