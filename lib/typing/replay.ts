import type { RunSample } from "./types";

export interface ReplayChar {
  char: string;
  /** true correct, false wrong, null not typed (or a word gap). */
  typedOk: boolean | null;
}

export interface ReplayModel {
  chars: ReplayChar[];
  timeline: number[];
  totalMs: number;
}

/**
 * Rebuilds a finished run from the target text, what was typed, and the
 * per-character timing trace recorded during the run.
 */
export function buildReplay(
  text: string,
  typed: string | undefined,
  timeline: number[],
  durationSec: number,
): ReplayModel {
  const targetWords = text.length ? text.split(" ") : [];
  const typedWords = (typed ?? "").length ? (typed as string).split(" ") : [];

  const chars: ReplayChar[] = [];
  targetWords.forEach((tw, wi) => {
    const yw = typedWords[wi] ?? "";
    for (let j = 0; j < tw.length; j += 1) {
      const typedCh = yw[j];
      chars.push({
        char: tw[j],
        typedOk: typedCh === undefined ? null : typedCh === tw[j],
      });
    }
    if (wi < targetWords.length - 1) chars.push({ char: " ", typedOk: null });
  });

  const lastTick = timeline.length ? timeline[timeline.length - 1] : 0;
  return {
    chars,
    timeline,
    totalMs: Math.max(1, durationSec * 1000, lastTick),
  };
}

/** How many characters the caret has passed at time `tMs`. */
export function caretIndexAt(model: ReplayModel, tMs: number): number {
  const t = Number.isFinite(tMs) ? tMs : 0;
  let lo = 0;
  let hi = model.timeline.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (model.timeline[mid] <= t) lo = mid + 1;
    else hi = mid;
  }
  return Math.max(0, Math.min(lo, model.chars.length));
}

/** The wpm/raw samples that would have been drawn by time `tMs`. */
export function samplesUpTo(samples: RunSample[], tMs: number): RunSample[] {
  const sec = Math.max(0, tMs) / 1000;
  return samples.filter((s) => s.t <= sec);
}
