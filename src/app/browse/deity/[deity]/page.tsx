import { notFound } from "next/navigation";
import { CategoryResults } from "@/components/CategoryResults";
import { CHANTS } from "@/data/chants";
import { DEITIES } from "@/data/taxonomy";
import type { Deity } from "@/data/types";

export function generateStaticParams() {
  return (Object.keys(DEITIES) as Deity[]).map((deity) => ({ deity }));
}

export async function generateMetadata({ params }: { params: Promise<{ deity: string }> }) {
  const { deity } = await params;
  const info = DEITIES[deity as Deity];
  return info ? { title: `${info.en} chants — Svaram` } : {};
}

export default async function DeityPage({ params }: { params: Promise<{ deity: string }> }) {
  const { deity } = await params;
  const info = DEITIES[deity as Deity];
  if (!info) notFound();

  const chants = CHANTS.filter((c) => c.deity.includes(deity as Deity));

  return (
    <CategoryResults
      eyebrow="Deity"
      title={`${info.emoji} ${info.en}`}
      native={info.hi}
      chants={chants}
    />
  );
}
