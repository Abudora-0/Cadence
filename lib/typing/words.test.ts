import { describe, expect, it } from "vitest";
import { DEFAULT_MODE_CONFIG, type ModeConfig } from "./types";
import { buildWords, estimateWordCount, seededFrom } from "./words";

const cfg = (over: Partial<ModeConfig> = {}): ModeConfig => ({
  ...DEFAULT_MODE_CONFIG,
  ...over,
});

describe("seededFrom", () => {
  it("is deterministic", () => {
    expect(seededFrom("cadence")).toBe(seededFrom("cadence"));
  });

  it("differs for different input", () => {
    expect(seededFrom("cadence")).not.toBe(seededFrom("Cadence"));
  });

  it("returns a non-negative 32 bit integer", () => {
    const v = seededFrom("anything at all");
    expect(Number.isInteger(v)).toBe(true);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(0xffffffff);
  });
});

describe("buildWords", () => {
  it("returns exactly the requested count", () => {
    expect(buildWords(cfg(), 25).length).toBe(25);
    expect(buildWords(cfg(), 1).length).toBe(1);
  });

  it("is deterministic for a given seed", () => {
    const a = buildWords(cfg(), 40, 12345);
    const b = buildWords(cfg(), 40, 12345);
    expect(a).toEqual(b);
  });

  it("varies with the seed", () => {
    const a = buildWords(cfg(), 40, 1);
    const b = buildWords(cfg(), 40, 2);
    expect(a).not.toEqual(b);
  });

  it("produces only lowercase letters when clean", () => {
    for (const word of buildWords(cfg({ punctuation: false, numbers: false }), 100, 7)) {
      expect(word).toMatch(/^[a-z]+$/);
    }
  });

  it("draws from a wider pool for english-1k", () => {
    const small = new Set(buildWords(cfg({ language: "english" }), 400, 3));
    const wide = new Set(buildWords(cfg({ language: "english-1k" }), 400, 3));
    expect(wide.size).toBeGreaterThan(small.size);
  });

  it("mixes in digit groups when numbers are on", () => {
    const words = buildWords(cfg({ numbers: true }), 400, 9);
    expect(words.some((w) => /^\d+$/.test(w))).toBe(true);
  });

  it("adds punctuation and capitals when punctuation is on", () => {
    const words = buildWords(cfg({ punctuation: true }), 400, 9);
    expect(words.some((w) => /[.,!?;:"'()-]/.test(w))).toBe(true);
    expect(words.some((w) => /^[A-Z]/.test(w))).toBe(true);
  });
});

describe("estimateWordCount", () => {
  it("uses the exact count in words mode", () => {
    expect(estimateWordCount(cfg({ mode: "words", wordCount: 50 }))).toBe(50);
  });

  it("scales with the time budget and leaves headroom", () => {
    const short = estimateWordCount(cfg({ mode: "time", timeSec: 15 }));
    const long = estimateWordCount(cfg({ mode: "time", timeSec: 120 }));
    expect(long).toBeGreaterThan(short);
    // 120s at ~140 wpm is ~280 words; the estimate should clear that.
    expect(long).toBeGreaterThanOrEqual(280);
  });
});
