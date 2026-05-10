import { api } from "encore.dev/api";
import {
  buildFortune,
  buildCommitMessage,
  buildDuckSession,
  analyzeVibe,
  VALID_MOODS,
  type FortuneResult,
  type VibeResult,
} from "./logic";

interface CommitResponse {
  message: string;
  mood: string;
  availableMoods: string[];
}

interface DuckRequest {
  problem: string;
}

interface DuckResponse {
  questions: string[];
  encouragement: string;
  problemWordCount: number;
}

interface VibeRequest {
  text: string;
}

export const getDailyFortune = api(
  { expose: true, method: "GET", path: "/oracle/fortune" },
  async (): Promise<FortuneResult> => buildFortune()
);

export const getCommitMessage = api(
  { expose: true, method: "GET", path: "/oracle/commit/:mood" },
  async ({ mood }: { mood: string }): Promise<CommitResponse> => ({
    ...buildCommitMessage(mood),
    availableMoods: VALID_MOODS,
  })
);

export const rubberDuck = api(
  { expose: true, method: "POST", path: "/oracle/rubber-duck" },
  async ({ problem }: DuckRequest): Promise<DuckResponse> =>
    buildDuckSession(problem)
);

export const vibeCheck = api(
  { expose: true, method: "POST", path: "/oracle/vibe-check" },
  async ({ text }: VibeRequest): Promise<VibeResult> => analyzeVibe(text)
);
