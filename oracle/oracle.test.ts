import { describe, it, expect } from "vitest";
import {
  buildFortune,
  buildCommitMessage,
  buildDuckSession,
  analyzeVibe,
  VALID_MOODS,
} from "./logic";

describe("oracle logic", () => {
  describe("buildFortune", () => {
    it("returns a fortune, card, and date", () => {
      const res = buildFortune();
      expect(res.fortune).toBeTruthy();
      expect(res.card).toMatch(/🃏/);
      expect(res.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("returns the same fortune twice in a row (deterministic by day)", () => {
      const a = buildFortune();
      const b = buildFortune();
      expect(a.fortune).toBe(b.fortune);
      expect(a.card).toBe(b.card);
    });
  });

  describe("buildCommitMessage", () => {
    it("returns a commit message for a known mood", () => {
      const res = buildCommitMessage("frustrated");
      expect(res.message).toBeTruthy();
      expect(res.mood).toBe("frustrated");
    });

    it("falls back to existential for an unknown mood", () => {
      const res = buildCommitMessage("chaotic-neutral");
      expect(res.message).toBeTruthy();
    });

    it("covers all available moods", () => {
      for (const mood of VALID_MOODS) {
        const res = buildCommitMessage(mood);
        expect(res.message).toBeTruthy();
      }
    });
  });

  describe("buildDuckSession", () => {
    it("returns 5 questions and encouragement", () => {
      const res = buildDuckSession("My code doesn't work and I don't know why");
      expect(res.questions).toHaveLength(5);
      expect(res.encouragement).toBeTruthy();
      expect(res.problemWordCount).toBeGreaterThan(0);
    });

    it("counts words accurately", () => {
      const res = buildDuckSession("one two three");
      expect(res.problemWordCount).toBe(3);
    });
  });

  describe("analyzeVibe", () => {
    it("scores positive text highly", () => {
      const res = analyzeVibe("This is amazing! I love it! It works perfectly! Great success!");
      expect(res.score).toBeGreaterThan(60);
    });

    it("scores negative text low", () => {
      const res = analyzeVibe("This is broken and horrible. Why does it crash? Terrible bug. Help.");
      expect(res.score).toBeLessThan(50);
    });

    it("returns score in 0-100 range", () => {
      const res = analyzeVibe("Hello world");
      expect(res.score).toBeGreaterThanOrEqual(0);
      expect(res.score).toBeLessThanOrEqual(100);
    });

    it("returns all required fields", () => {
      const res = analyzeVibe("Hello world");
      expect(res).toHaveProperty("score");
      expect(res).toHaveProperty("label");
      expect(res).toHaveProperty("energy");
      expect(res).toHaveProperty("advice");
      expect(res).toHaveProperty("positiveSignals");
      expect(res).toHaveProperty("negativeSignals");
      expect(res).toHaveProperty("excitementLevel");
      expect(res).toHaveProperty("uncertaintyLevel");
    });

    it("detects excitement from exclamation marks", () => {
      const calm = analyzeVibe("everything is fine");
      const excited = analyzeVibe("everything is fine!!!!!!");
      expect(excited.excitementLevel).toBeGreaterThan(calm.excitementLevel);
    });
  });
});
