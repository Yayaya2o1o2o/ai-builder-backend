// ─── Data ────────────────────────────────────────────────────────────────────

export const FORTUNES = [
  "The bug you seek is in the last place you'll check. Check there first.",
  "It works on your machine. Perhaps ship your machine.",
  "The rubber duck on your desk holds the answer. Consult it.",
  "Off by one. Off by one. Off by one. Off by zero.",
  "There are only two hard things in CS: cache invalidation, naming things, and off-by-one errors.",
  "The merge conflict you dread is written in the stars — and also in main.",
  "A linter warning ignored is a production bug deferred.",
  "Your git history is a novel. Today's chapter: 'wip wip wip'.",
  "The answer lives in the docs. The docs are slightly wrong.",
  "Stack Overflow has seen this. Stack Overflow has seen everything.",
  "Your API will receive exactly the input you did not validate.",
  "The fastest code is code that doesn't run. Consider deleting everything.",
  "Null is not an option. It is the option chosen for you.",
  "The cron job will run at the wrong time. You defined the wrong time.",
  "Types are prophecies. Heed them.",
  "The test that always passes tests nothing.",
  "Technical debt is emotional debt with better accounting.",
  "The deployment will succeed in a way you did not expect.",
  "Your environment variables are correct. The .env file is not loaded.",
  "It is not a race condition if there is only one thread. Consider this.",
  "The comment says 'do not touch'. You will touch it.",
  "The legacy code was written by you, six months ago, in haste.",
  "LGTM is a prayer, not a review.",
  "The console.log you forgot is now in production.",
  "The edge case is not an edge case. It is the entire product.",
  "The README has not been updated since the third commit.",
  "It is only a hack if it ships. It always ships.",
  "Try turning it off and on again. No — the other thing.",
  "Your regex is correct. Test it one more time.",
  "The cloud is just someone else's computer having a bad day.",
  "A microservice is a macro problem with better naming.",
  "The 200 OK response is lying to you.",
  "Unit tests are love letters to your future self. Write more.",
  "You are not stuck. You are building context.",
  "The solution is elegant. The implementation is not. Ship both.",
  "Write code as if the person maintaining it knows your address.",
  "There is no spoon. There is also no thread safety.",
  "Make it work, make it right, make it fast. You are on step one.",
  "The API contract is sacred. Until the breaking change.",
  "Your branch is 200 commits behind main. Godspeed.",
  "The bug report is accurate. The steps to reproduce are fiction.",
  "You will find the bug 5 minutes after posting to Stack Overflow.",
  "The feature flag is on. The feature is not working. This is fine.",
  "Sleep on it. The bug will still be there. You will be better.",
  "The error message is clear. You are not reading the error message.",
  "The performance issue is in the for loop. The for loop is everywhere.",
  "Naming things is hard. You have named it 'data'.",
  "Your PR will be merged. After one more change.",
  "42. No further context.",
  "The docker container is healthy. The app inside is not.",
  "Hope is not a strategy. Neither is '// TODO: fix later'.",
  "The API rate limit was not in the docs. It is in the response headers.",
  "Push to prod on Friday. Just kidding. Never push to prod on Friday.",
  "The hotfix is cold now.",
  "You don't need more RAM. You need fewer memory leaks.",
  "The serverless function is not serverless. The server is just hidden.",
  "Code without tests is legacy code the moment it ships.",
  "The AI wrote it. You own it.",
  "The timeout was 30 seconds. The request takes 31.",
  "You have git stashed something important. You have forgotten what.",
  "The type is `any`. The bug is everything.",
  "import { courage } from 'yourself' — module not found. Write it yourself.",
  "The infinite loop was finite all along. It ran for a very long time.",
  "Rebase, don't merge. Or merge. The conflict is inevitable.",
  "The interview problem is not the job problem. The job problem is harder.",
  "There is a newer version. It has different problems.",
  "Your standup will be 2 minutes. Your standup will be 20 minutes.",
  "Ctrl+Z. Ctrl+Z. Ctrl+Z. Save.",
  "The mutation is unexpected. The mutation was always expected.",
  "The password is 'password'. You will be ashamed.",
];

export const COMMIT_MESSAGES: Record<string, string[]> = {
  frustrated: [
    "fix: why the HELL does this work now",
    "fix: ok fine whatever this works I'm done",
    "fix: revert the revert of the revert",
    "chore: sacrifice to the CI gods",
    "fix: I don't know why this works and I don't care",
    "fix: brute-forced through the problem like a bulldozer of despair",
    "fix: undefined is not a feeling but it should be",
    "fix: console.log('here') was the answer. I hate myself.",
    "fix: somehow works now. not asking questions.",
    "REVERT EVERYTHING REVERT EVERYTHING",
  ],
  happy: [
    "feat: add amazing feature that will delight users",
    "refactor: code so clean it sparkles",
    "feat: beautiful, elegant solution achieved",
    "fix: one line fix, three hours well spent",
    "feat: this is my magnum opus",
    "fix: rubber duck debugging saved the day again",
    "perf: 10x faster, 10x happier",
    "feat: added tests because I love future me",
    "feat: shipped it and it worked first try",
    "chore: loving every commit message today",
  ],
  tired: [
    "fix: fixed (hopefully)",
    "wip: wip",
    "chore: stuff",
    "fix: changes",
    "fix: more changes to the changes",
    "fix: it was a typo",
    "fix: it was another typo",
    "chore: idk man",
    "fix: sleep-driven development",
    "fix: 🙃",
  ],
  caffeinated: [
    "feat!: REWROTE EVERYTHING (just kidding, added a button)",
    "feat: 47 things in one commit because coffee",
    "refactor: MAXIMUM ABSTRACTION ACHIEVED",
    "chore: organized every file, renamed everything, touched nothing",
    "feat: microservices for the microservices",
    "perf: O(1) or bust, rewrote the algorithm at 2am",
    "feat: added feature, wrote docs, reviewed PRs, learned Rust",
    "refactor: 500 line file → 500 files of 1 line each",
    "feat: invented a new design pattern mid-sprint",
    "chore: the CI is now sentient",
  ],
  existential: [
    "fix: what even is a bug if not the natural state of code",
    "feat: added feature to a world that may not deserve it",
    "chore: maintained the simulation",
    "fix: the real bug was the friends we made along the way",
    "refactor: rearranged deck chairs on the Titanic (lovingly)",
    "fix: closed the loop, opened the void",
    "feat: perhaps all software is just a long conversation with entropy",
    "fix: the error was always within",
    "chore: stared into the codebase; it stared back",
    "fix: shipped consciousness into the void",
  ],
};

export const DUCK_QUESTIONS = [
  "Can you explain the problem as if I were five years old?",
  "What did you expect to happen, and what actually happened?",
  "Have you checked that your assumptions are correct at each step?",
  "When did this last work, and what changed since then?",
  "Have you tried the simplest possible version of this problem?",
  "What error message are you actually getting? All of it?",
  "Are you solving the right problem, or a symptom of a different one?",
  "Have you searched for this exact error message online?",
  "What would you do if you couldn't use the internet for an hour?",
  "Can you reproduce this in a minimal, isolated example?",
  "What does the documentation say this function should do?",
  "Have you added logging at every step to confirm your assumptions?",
  "Is this a problem with the code, the data, or your understanding?",
  "What would you tell a new developer to look for here?",
  "Have you taken a real break? Not a tab-switching break. A real one.",
  "Can you describe the exact system state right before the bug occurs?",
  "Is this consistent, or does it happen intermittently?",
  "What are the inputs? Are you certain about their types and values?",
  "If the bug is in a third-party library, can you work around it?",
  "Have you asked yourself: is the issue upstream of where I'm looking?",
];

export const ENCOURAGEMENTS = [
  "You've got this. The bug is mortal.",
  "Every great engineer has stood exactly where you stand.",
  "The answer is closer than it feels right now.",
  "Confusion is just understanding loading.",
  "You are not blocked. You are researching.",
  "The duck believes in you.",
  "Sleep, water, then code. In that order.",
  "The bug is scared of you. It should be.",
];

export const TAROT_CARDS = [
  "🃏 The Stack Trace", "🃏 The Rubber Duck", "🃏 The Race Condition",
  "🃏 The Merge Conflict", "🃏 The Missing Semicolon", "🃏 The Off-By-One",
  "🃏 The Stale Cache", "🃏 The Missing .env", "🃏 The Infinite Loop",
  "🃏 The Null Pointer", "🃏 The Senior Review", "🃏 The Friday Deploy",
];

export const POSITIVE_WORDS = new Set([
  "love", "great", "awesome", "amazing", "perfect", "excellent", "good",
  "happy", "nice", "wonderful", "fantastic", "brilliant", "beautiful",
  "elegant", "clean", "fast", "simple", "clear", "works", "fixed",
  "done", "shipped", "yes", "win", "success", "solved",
]);

export const NEGATIVE_WORDS = new Set([
  "hate", "broken", "bug", "error", "fail", "crash", "horrible", "terrible",
  "bad", "wrong", "ugly", "slow", "complex", "mess", "disaster", "awful",
  "dead", "cursed", "garbage", "trash", "nightmare", "pain", "ugh",
  "why", "what", "help", "stuck", "lost", "confused",
]);

// ─── Seeded RNG ───────────────────────────────────────────────────────────────

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = Math.imul(state ^ (state >>> 16), 0x45d9f3b);
    state = Math.imul(state ^ (state >>> 16), 0x45d9f3b);
    state ^= state >>> 16;
    return (state >>> 0) / 0xffffffff;
  };
}

export function dailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ─── Business logic ───────────────────────────────────────────────────────────

export interface FortuneResult {
  fortune: string;
  card: string;
  date: string;
}

export function buildFortune(): FortuneResult {
  const seed = dailySeed();
  const rng = seededRandom(seed);
  return {
    fortune: pick(FORTUNES, rng),
    card: pick(TAROT_CARDS, rng),
    date: new Date().toISOString().split("T")[0],
  };
}

export const VALID_MOODS = Object.keys(COMMIT_MESSAGES);

export function buildCommitMessage(mood: string): { message: string; mood: string } {
  const normalizedMood = mood.toLowerCase();
  const messages = COMMIT_MESSAGES[normalizedMood] ?? COMMIT_MESSAGES["existential"];
  const rng = seededRandom(Date.now() ^ (Math.random() * 0xffffffff));
  return { message: pick(messages, rng), mood: normalizedMood };
}

export function buildDuckSession(problem: string): {
  questions: string[];
  encouragement: string;
  problemWordCount: number;
} {
  const rng = seededRandom(
    problem.split("").reduce((acc, c) => acc ^ c.charCodeAt(0), Date.now())
  );
  const shuffled = [...DUCK_QUESTIONS].sort(() => rng() - 0.5);
  return {
    questions: shuffled.slice(0, 5),
    encouragement: pick(ENCOURAGEMENTS, rng),
    problemWordCount: problem.trim().split(/\s+/).length,
  };
}

const VIBE_LABELS: [number, string][] = [
  [90, "Absolutely Vibing"],
  [70, "Good Vibes Only"],
  [55, "Mostly Vibing"],
  [40, "Neutral Purgatory"],
  [25, "Vibe Disrupted"],
  [10, "Anti-Vibe Detected"],
  [0,  "Vibe Catastrophe"],
];

const VIBE_ADVICE: [number, string][] = [
  [80, "Keep the energy. Ship it."],
  [60, "Solid state. Maybe add a test."],
  [40, "Take a walk. Come back fresh."],
  [20, "Step away from the keyboard. This is an order."],
  [0,  "Log off. Touch grass. Hydrate. Return tomorrow."],
];

const ENERGY_LEVELS: [number, string][] = [
  [80, "Caffeinated"],
  [60, "Alert"],
  [40, "Coasting"],
  [20, "Depleted"],
  [0,  "Running on fumes"],
];

function classify(value: number, scale: [number, string][]): string {
  for (const [threshold, label] of scale) {
    if (value >= threshold) return label;
  }
  return scale[scale.length - 1][1];
}

export interface VibeResult {
  score: number;
  label: string;
  energy: string;
  positiveSignals: number;
  negativeSignals: number;
  excitementLevel: number;
  uncertaintyLevel: number;
  advice: string;
}

export function analyzeVibe(text: string): VibeResult {
  const lower = text.toLowerCase();
  const words = lower.match(/\b\w+\b/g) ?? [];
  const totalWords = Math.max(words.length, 1);

  const positiveSignals = words.filter((w) => POSITIVE_WORDS.has(w)).length;
  const negativeSignals = words.filter((w) => NEGATIVE_WORDS.has(w)).length;
  const excitementLevel = (text.match(/!/g) ?? []).length;
  const uncertaintyLevel = (text.match(/\?/g) ?? []).length;
  const capsRatio = (text.match(/[A-Z]/g) ?? []).length / Math.max(text.length, 1);

  const baseScore =
    50 +
    (positiveSignals / totalWords) * 40 -
    (negativeSignals / totalWords) * 40 +
    Math.min(excitementLevel * 3, 15) -
    Math.min(uncertaintyLevel * 3, 15) +
    Math.min(capsRatio * 30, 10);

  const score = Math.round(Math.min(100, Math.max(0, baseScore)));

  return {
    score,
    label: classify(score, VIBE_LABELS),
    energy: classify(excitementLevel * 20 + capsRatio * 50, ENERGY_LEVELS),
    positiveSignals,
    negativeSignals,
    excitementLevel,
    uncertaintyLevel,
    advice: classify(score, VIBE_ADVICE),
  };
}
