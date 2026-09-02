import { describe, expect, it } from "vitest";
import {
  DEFAULT_HARD_KEYS,
  aggregateKeyStats,
  buildWeakKeyWords,
  weakKeys,
} from "./weak-keys";
import type { KeyStat, RunResult } from "./types";

const run = (keyStats: Record<string, KeyStat>): RunResult =>
  ({ keyStats }) as RunResult;

describe("aggregateKeyStats", () => {
  it("sums correct and incorrect across runs", () => {
    const agg = aggregateKeyStats([
      run({ a: { correct: 3, incorrect: 1 }, b: { correct: 0, incorrect: 2 } }),
      run({ a: { correct: 2, incorrect: 0 } }),
    ]);
    expect(agg.a).toEqual({ correct: 5, incorrect: 1 });
    expect(agg.b).toEqual({ correct: 0, incorrect: 2 });
  });

  it("tolerates runs with no key data", () => {
    expect(aggregateKeyStats([{} as RunResult])).toEqual({});
  });
});

describe("weakKeys", () => {
  it("falls back to the default hard keys with no data", () => {
    const w = weakKeys({});
    expect(w.basedOnHistory).toBe(false);
    expect(w.keys).toEqual(DEFAULT_HARD_KEYS.slice(0, w.keys.length));
  });

  it("ranks the least accurate keys first once there is enough data", () => {
    const agg = {
      a: { correct: 20, incorrect: 0 },
      s: { correct: 18, incorrect: 2 },
      d: { correct: 5, incorrect: 15 },
      f: { correct: 10, incorrect: 10 },
      g: { correct: 19, incorrect: 1 },
      h: { correct: 8, incorrect: 12 },
    };
    const w = weakKeys(agg, { min: 6, count: 3 });
    expect(w.basedOnHistory).toBe(true);
    expect(w.keys[0]).toBe("d");
    expect(w.keys).toContain("h");
    expect(w.keys).not.toContain("a");
  });

  it("ignores keys below the sample threshold", () => {
    const agg = {
      q: { correct: 0, incorrect: 2 },
      a: { correct: 10, incorrect: 10 },
      s: { correct: 12, incorrect: 8 },
      d: { correct: 14, incorrect: 6 },
    };
    const w = weakKeys(agg, { min: 6, count: 3 });
    expect(w.keys).not.toContain("q");
  });

  it("only considers single latin letters", () => {
    const agg = {
      space: { correct: 1, incorrect: 40 },
      ".": { correct: 1, incorrect: 40 },
      k: { correct: 5, incorrect: 15 },
      l: { correct: 6, incorrect: 14 },
      m: { correct: 7, incorrect: 13 },
    };
    const w = weakKeys(agg, { min: 6, count: 4 });
    expect(w.keys).not.toContain("space");
    expect(w.keys).not.toContain(".");
  });
});

describe("buildWeakKeyWords", () => {
  const POOL = ["the", "quick", "brown", "fox", "jumps", "lazy", "zebra", "puzzle", "jazz", "buzz"];

  it("returns the requested count and is seed-deterministic", () => {
    const a = buildWeakKeyWords(POOL, ["z"], 20, 42);
    const b = buildWeakKeyWords(POOL, ["z"], 20, 42);
    expect(a).toHaveLength(20);
    expect(a).toEqual(b);
  });

  it("over-represents words rich in the weak letters", () => {
    const withZ = buildWeakKeyWords(POOL, ["z"], 200, 7).filter((w) => w.includes("z"));
    const withoutBias = buildWeakKeyWords(POOL, [], 200, 7).filter((w) => w.includes("z"));
    expect(withZ.length).toBeGreaterThan(withoutBias.length);
  });

  it("stays inside the pool", () => {
    const set = new Set(POOL);
    for (const w of buildWeakKeyWords(POOL, ["u", "z"], 50, 3)) {
      expect(set.has(w)).toBe(true);
    }
  });
});
