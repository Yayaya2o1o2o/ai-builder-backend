import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChantCard } from "@/components/ChantCard";
import type { Chant } from "@/data/types";

export function CategoryResults({
  eyebrow,
  title,
  native,
  description,
  chants,
}: {
  eyebrow: string;
  title: string;
  native?: string;
  description?: string;
  chants: Chant[];
}) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-sm font-medium uppercase tracking-wide opacity-50">{eyebrow}</p>
        <h1 className="font-display mt-1 text-3xl font-semibold sm:text-4xl">{title}</h1>
        {native && <p className="font-hi mt-1 text-xl opacity-60">{native}</p>}
        {description && <p className="mt-3 max-w-2xl opacity-70">{description}</p>}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chants.map((c, i) => (
            <ChantCard key={c.slug} chant={c} index={i} />
          ))}
        </div>
        {chants.length === 0 && <p className="mt-10 opacity-60">No chants tagged here yet — check back soon.</p>}
      </main>
      <Footer />
    </>
  );
}
