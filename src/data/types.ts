export type Deity =
  | "ganesha"
  | "shiva"
  | "vishnu"
  | "rama"
  | "krishna"
  | "hanuman"
  | "devi"
  | "durga"
  | "lakshmi"
  | "saraswati"
  | "surya"
  | "shani"
  | "sai-baba"
  | "skanda"
  | "general";

export type ChantType =
  | "aarti"
  | "chalisa"
  | "mantra"
  | "stotra"
  | "bhajan"
  | "mangalacharan"
  | "ashtakam"
  | "suprabhatam";

export type Occasion =
  | "daily-morning"
  | "daily-evening"
  | "diwali"
  | "navratri"
  | "ganesh-chaturthi"
  | "maha-shivratri"
  | "ram-navami"
  | "janmashtami"
  | "hanuman-jayanti"
  | "vasant-panchami"
  | "guru-purnima"
  | "karva-chauth"
  | "raksha-bandhan"
  | "general-puja";

/**
 * `hi` holds the canonical Devanagari text (Sanskrit or Hindi).
 * `en` is a rhythmic, easy-to-read Roman transliteration for chanting aloud.
 * Tamil / Telugu / Kannada renderings are derived from `hi` at runtime via
 * script transliteration (see lib/transliterate.ts) rather than hand-authored,
 * since script-to-script conversion is phonetically deterministic and this
 * avoids introducing typos in scripts we can't easily proofread.
 */
export interface ChantLine {
  hi: string;
  en: string;
}

export interface Chant {
  slug: string;
  title: { hi: string; en: string };
  deity: Deity[];
  type: ChantType;
  occasions: Occasion[];
  tags: string[];
  durationMin: number;
  lines: ChantLine[];
  /** Plain-English meaning / summary of what the chant says and when it's used. */
  meaningEn: string;
  /** Short note on the traditional source / attribution. */
  source: string;
}
