import { notFound } from "next/navigation";
import { CategoryResults } from "@/components/CategoryResults";
import { CHANTS } from "@/data/chants";
import { CHANT_TYPES } from "@/data/taxonomy";
import type { ChantType } from "@/data/types";

export function generateStaticParams() {
  return (Object.keys(CHANT_TYPES) as ChantType[]).map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const info = CHANT_TYPES[type as ChantType];
  return info ? { title: `${info.en} — Svaram` } : {};
}

export default async function TypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const info = CHANT_TYPES[type as ChantType];
  if (!info) notFound();

  const chants = CHANTS.filter((c) => c.type === (type as ChantType));

  return (
    <CategoryResults eyebrow="Type" title={info.en} native={info.hi} description={info.description} chants={chants} />
  );
}
