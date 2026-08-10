import { notFound } from "next/navigation";
import { CategoryResults } from "@/components/CategoryResults";
import { CHANTS } from "@/data/chants";
import { OCCASIONS } from "@/data/taxonomy";
import type { Occasion } from "@/data/types";

export function generateStaticParams() {
  return (Object.keys(OCCASIONS) as Occasion[]).map((occasion) => ({ occasion }));
}

export async function generateMetadata({ params }: { params: Promise<{ occasion: string }> }) {
  const { occasion } = await params;
  const info = OCCASIONS[occasion as Occasion];
  return info ? { title: `${info.en} chants — Svaram` } : {};
}

export default async function OccasionPage({ params }: { params: Promise<{ occasion: string }> }) {
  const { occasion } = await params;
  const info = OCCASIONS[occasion as Occasion];
  if (!info) notFound();

  const chants = CHANTS.filter((c) => c.occasions.includes(occasion as Occasion));

  return <CategoryResults eyebrow="Occasion" title={info.en} native={info.hi} chants={chants} />;
}
