import Fuse from "fuse.js";
import { CHANTS } from "@/data/chants";
import { CHANT_TYPES, DEITIES, OCCASIONS } from "@/data/taxonomy";
import type { Chant } from "@/data/types";

const searchDocs = CHANTS.map((c) => ({
  chant: c,
  titleEn: c.title.en,
  titleHi: c.title.hi,
  tags: c.tags.join(" "),
  deityNames: c.deity.map((d) => DEITIES[d].en).join(" "),
  occasionNames: c.occasions.map((o) => OCCASIONS[o].en).join(" "),
  typeName: CHANT_TYPES[c.type].en,
  meaning: c.meaningEn,
}));

const fuse = new Fuse(searchDocs, {
  keys: [
    { name: "titleEn", weight: 3 },
    { name: "titleHi", weight: 3 },
    { name: "tags", weight: 2 },
    { name: "deityNames", weight: 2 },
    { name: "occasionNames", weight: 1.5 },
    { name: "typeName", weight: 1 },
    { name: "meaning", weight: 0.5 },
  ],
  threshold: 0.25,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

export function searchChants(query: string): Chant[] {
  const trimmed = query.trim();
  if (!trimmed) return CHANTS;
  return fuse.search(trimmed).map((r) => r.item.chant);
}

export function getChantBySlug(slug: string): Chant | undefined {
  return CHANTS.find((c) => c.slug === slug);
}
