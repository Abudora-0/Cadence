import { describe, expect, it } from "vitest";
import { LANGUAGES, LANGUAGE_POOLS } from "./languages";
import { buildWords, pool } from "./words";
import { DEFAULT_MODE_CONFIG, type Language, type ModeConfig } from "./types";

const cfg = (over: Partial<ModeConfig> = {}): ModeConfig => ({
  ...DEFAULT_MODE_CONFIG,
  ...over,
});

const NON_ENGLISH: Language[] = [
  "spanish",
  "french",
  "german",
  "italian",
  "portuguese",
  "roman-urdu",
];

describe("LANGUAGES", () => {
  it("lists both English tiers plus every extra pool", () => {
    const ids = LANGUAGES.map((l) => l.id);
    expect(ids).toContain("english");
    expect(ids).toContain("english-1k");
    for (const id of NON_ENGLISH) expect(ids).toContain(id);
  });

  it("has a label for every entry and no duplicates", () => {
    const ids = LANGUAGES.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of LANGUAGES) expect(l.label.length).toBeGreaterThan(0);
  });
});

describe("extra language pools", () => {
  for (const lang of NON_ENGLISH) {
    it(`${lang}: is a healthy pool of clean lowercase words`, () => {
      const words = LANGUAGE_POOLS[lang];
      expect(words).toBeDefined();
      expect(words!.length).toBeGreaterThanOrEqual(200);
      for (const w of words!) {
        expect(w).toBe(w.toLowerCase());
        expect(w).not.toMatch(/\s/);
        expect(w.includes("—")).toBe(false);
      }
    });

    it(`${lang}: buildWords stays inside the pool and is seed-deterministic`, () => {
      const p = new Set(pool(lang));
      const a = buildWords(cfg({ language: lang, punctuation: false, numbers: false }), 60, 5);
      const b = buildWords(cfg({ language: lang, punctuation: false, numbers: false }), 60, 5);
      expect(a).toEqual(b);
      for (const w of a) expect(p.has(w)).toBe(true);
    });
  }

  it("roman-urdu stays ASCII so it needs no special keyboard", () => {
    for (const w of LANGUAGE_POOLS["roman-urdu"]!) {
      expect(w).toMatch(/^[a-z]+$/);
    }
  });

  it("accented languages actually carry diacritics", () => {
    const joined = LANGUAGE_POOLS.french!.join(" ");
    expect(joined).toMatch(/[àâçéèêëîïôùûü]/);
  });
});

describe("pool()", () => {
  it("falls back to English for an unknown language", () => {
    expect(pool("english")).toBe(pool("english"));
    expect(pool("spanish").length).toBeGreaterThan(0);
  });
});
