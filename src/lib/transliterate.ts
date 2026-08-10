import Sanscript from "@indic-transliteration/sanscript";
import type { LanguageCode } from "@/data/taxonomy";

const SCRIPT_BY_LANGUAGE: Partial<Record<LanguageCode, string>> = {
  ta: "tamil",
  te: "telugu",
  kn: "kannada",
};

/**
 * Renders Devanagari source text in another Indic script.
 * Tamil/Telugu/Kannada are derived deterministically from the Devanagari
 * original so every script stays phonetically faithful without needing a
 * hand-typed (and hand-proofread) copy in each script.
 */
export function renderInScript(devanagari: string, language: LanguageCode): string {
  const scheme = SCRIPT_BY_LANGUAGE[language];
  if (!scheme) return devanagari;
  return Sanscript.t(devanagari, "devanagari", scheme);
}
