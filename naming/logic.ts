// ─── Tokenizer ────────────────────────────────────────────────────────────────

export function tokenize(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[-_.\s]+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean);
}

// ─── Converters ───────────────────────────────────────────────────────────────

export function toCamelCase(tokens: string[]): string {
  return tokens.map((t, i) => (i === 0 ? t : t[0].toUpperCase() + t.slice(1))).join("");
}

export function toPascalCase(tokens: string[]): string {
  return tokens.map((t) => t[0].toUpperCase() + t.slice(1)).join("");
}

export function toSnakeCase(tokens: string[]): string {
  return tokens.join("_");
}

export function toScreamingSnakeCase(tokens: string[]): string {
  return tokens.join("_").toUpperCase();
}

export function toKebabCase(tokens: string[]): string {
  return tokens.join("-");
}

export function toTrainCase(tokens: string[]): string {
  return tokens.map((t) => t[0].toUpperCase() + t.slice(1)).join("-");
}

export function toDotCase(tokens: string[]): string {
  return tokens.join(".");
}

export function toFlatCase(tokens: string[]): string {
  return tokens.join("");
}

export interface ConvertResult {
  original: string;
  tokens: string[];
  camelCase: string;
  PascalCase: string;
  snake_case: string;
  SCREAMING_SNAKE_CASE: string;
  "kebab-case": string;
  "Train-Case": string;
  "dot.case": string;
  flatcase: string;
}

export function convertAll(input: string): ConvertResult {
  const tokens = tokenize(input);
  return {
    original: input,
    tokens,
    camelCase: toCamelCase(tokens),
    PascalCase: toPascalCase(tokens),
    snake_case: toSnakeCase(tokens),
    SCREAMING_SNAKE_CASE: toScreamingSnakeCase(tokens),
    "kebab-case": toKebabCase(tokens),
    "Train-Case": toTrainCase(tokens),
    "dot.case": toDotCase(tokens),
    flatcase: toFlatCase(tokens),
  };
}

// ─── Name generation ──────────────────────────────────────────────────────────

const ADJECTIVES: Record<string, string[]> = {
  startup: ["blazing", "cosmic", "quantum", "hyper", "turbo", "stellar", "atomic", "apex", "neon", "void", "ultra", "nova"],
  "dev-tool": ["fast", "smart", "lean", "sharp", "deep", "micro", "super", "meta", "open", "true", "pure", "raw"],
  cli: ["bx", "qx", "nx", "zx", "fx", "rx", "vx", "px", "dx", "lx", "wx", "cx"],
  saas: ["bright", "clear", "swift", "sleek", "bold", "prime", "peak", "core", "base", "hub", "flow", "sync"],
};

const NOUNS: Record<string, string[]> = {
  startup: ["forge", "nexus", "pulse", "core", "sync", "flow", "hub", "node", "grid", "loop", "beam", "vault"],
  "dev-tool": ["kit", "box", "bin", "run", "watch", "lint", "test", "gen", "build", "pack", "scan", "check"],
  cli: ["forge", "run", "go", "do", "cmd", "run", "kit", "bot", "cli", "fly", "bin", "exe"],
  saas: ["io", "ai", "hq", "app", "co", "ly", "so", "fy", "ify", "ize", "able", "wise"],
};

export const VALID_STYLES = Object.keys(ADJECTIVES);

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = Math.imul(state ^ (state >>> 16), 0x45d9f3b);
    state = Math.imul(state ^ (state >>> 16), 0x45d9f3b);
    state ^= state >>> 16;
    return (state >>> 0) / 0xffffffff;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function generateNames(style: string, count: number): string[] {
  const resolvedStyle = VALID_STYLES.includes(style) ? style : "startup";
  const resolvedCount = Math.min(Math.max(count, 1), 10);
  const adjs = ADJECTIVES[resolvedStyle];
  const nouns = NOUNS[resolvedStyle];
  const rng = seededRandom(Date.now() ^ (Math.random() * 0xffffffff));

  const seen = new Set<string>();
  const suggestions: string[] = [];

  while (suggestions.length < resolvedCount) {
    const adj = pick(adjs, rng);
    const noun = pick(nouns, rng);
    let name: string;

    if (resolvedStyle === "cli") {
      name = `${adj}${noun}`;
    } else if (resolvedStyle === "saas") {
      const base = noun.match(/^[a-z]{1,3}$/) ? adj : `${adj}${noun}`;
      const suffix = noun.match(/^[a-z]{1,3}$/) ? `.${noun}` : "";
      name = `${toPascalCase([base])}${suffix}`;
    } else if (resolvedStyle === "dev-tool") {
      name = toKebabCase([adj, noun]);
    } else {
      name = toPascalCase([adj, noun]);
    }

    if (!seen.has(name)) {
      seen.add(name);
      suggestions.push(name);
    }
  }

  return suggestions;
}
