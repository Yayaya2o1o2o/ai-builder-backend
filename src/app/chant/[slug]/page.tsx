import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChantReader } from "@/components/ChantReader";
import { CHANTS } from "@/data/chants";

export function generateStaticParams() {
  return CHANTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chant = CHANTS.find((c) => c.slug === slug);
  if (!chant) return {};
  return {
    title: `${chant.title.en} — Svaram`,
    description: chant.meaningEn,
  };
}

export default async function ChantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chant = CHANTS.find((c) => c.slug === slug);
  if (!chant) notFound();

  return (
    <>
      <Header />
      <main>
        <ChantReader chant={chant} />
      </main>
      <Footer />
    </>
  );
}
