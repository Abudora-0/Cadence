import { mulberry32 } from "./rng";
import type { KeyStat, RunResult } from "./types";

/**
 * The weak-key drill. It looks at the per-key accuracy recorded on every run,
 * finds the letters you are worst at, and builds a run out of real words that
 * lean on those letters.
 */

/** Reach and pinky keys most people are shakiest on, used until there is data. */
export const DEFAULT_HARD_KEYS = ["p", "q", "z", "x", "b", "k", "v", "y", "j", "g"];

const MIN_SAMPLES = 6;
const KEY_COUNT = 6;
/** z for a 95% Wilson interval. */
const Z = 1.96;

/** Merge the per-key tallies from many runs into one. */
export function aggregateKeyStats(runs: RunResult[]): Record<string, KeyStat> {
  const out: Record<string, KeyStat> = {};
  for (const run of runs) {
    for (const [key, stat] of Object.entries(run.keyStats ?? {})) {
      const prev = out[key] ?? { correct: 0, incorrect: 0 };
      out[key] = {
        correct: prev.correct + stat.correct,
        incorrect: prev.incorrect + stat.incorrect,
      };
    }
  }
  return out;
}

/** Wilson score lower bound for a run of `ok` successes out of `n`. */
function wilsonLower(ok: number, n: number): number {
  if (n === 0) return 0;
  const p = ok / n;
  const z2 = Z * Z;
  const denom = 1 + z2 / n;
  const centre = p + z2 / (2 * n);
  const margin = Z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);
  return (centre - margin) / denom;
}

export interface WeakKeys {
  keys: string[];
  /** True when the list is driven by real history rather than the defaults. */
  basedOnHistory: boolean;
  /** How many keys had enough samples to judge. */
  measured: number;
}

/**
 * The letters most worth drilling, worst first. Keys with few samples are
 * pulled toward the mean by the Wilson bound so a single slip does not put a
 * key at the top. Falls back to `DEFAULT_HARD_KEYS` while data is thin.
 */
export function weakKeys(
  agg: Record<string, KeyStat>,
  opts: { min?: number; count?: number } = {},
): WeakKeys {
  const min = opts.min ?? MIN_SAMPLES;
  const count = opts.count ?? KEY_COUNT;

  const scored = Object.entries(agg)
    .filter(([k]) => /^[a-z]$/.test(k))
    .map(([k, s]) => {
      const total = s.correct + s.incorrect;
      return { k, total, lb: wilsonLower(s.correct, total) };
    })
    .filter((e) => e.total >= min)
    .sort((a, b) => a.lb - b.lb);

  const picked = scored.slice(0, count).map((e) => e.k);
  const basedOnHistory = picked.length >= Math.min(3, count);

  if (picked.length < count) {
    for (const k of DEFAULT_HARD_KEYS) {
      if (picked.length >= count) break;
      if (!picked.includes(k)) picked.push(k);
    }
  }

  return { keys: picked.slice(0, count), basedOnHistory, measured: scored.length };
}

/**
 * Build a drill word list. Words are still drawn from the language pool, but
 * ones rich in the weak letters are far more likely to be chosen, so the text
 * reads normally while hammering the keys you miss. Deterministic given a seed.
 */
export function buildWeakKeyWords(
  languagePool: string[],
  weak: string[],
  count: number,
  seed?: number,
): string[] {
  const rand = seed === undefined ? Math.random : mulberry32(seed);
  const weakSet = new Set(weak.map((k) => k.toLowerCase()));

  const weighted = languagePool.map((w) => {
    let hits = 0;
    for (const ch of w.toLowerCase()) if (weakSet.has(ch)) hits += 1;
    // Quadratic so a word with two weak letters clearly beats one with a single
    // hit, without completely starving the plainer words.
    return { w, weight: 1 + hits * hits * 3 };
  });

  const totalWeight = weighted.reduce((a, e) => a + e.weight, 0);
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) {
    let r = rand() * totalWeight;
    let pick = weighted[0].w;
    for (const e of weighted) {
      r -= e.weight;
      if (r <= 0) {
        pick = e.w;
        break;
      }
    }
    out.push(pick);
  }
  return out;
}
