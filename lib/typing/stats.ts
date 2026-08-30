import type { RunSample } from "./types";

export const CHARS_PER_WORD = 5;

export function wpmFrom(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60000;
  return (correctChars / CHARS_PER_WORD) / minutes;
}

export function accuracyFrom(correct: number, total: number): number {
  if (total <= 0) return 100;
  return (correct / total) * 100;
}

/**
 * Consistency is derived from how steady the per-second wpm samples are.
 * A perfectly flat run scores 100, a wildly swinging run trends toward 0.
 */
export function consistencyFrom(samples: RunSample[]): number {
  const values = samples.map((s) => s.wpm).filter((v) => v > 0);
  if (values.length < 2) return 100;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const cv = Math.sqrt(variance) / mean;
  return Math.max(0, Math.min(100, (1 - cv) * 100));
}

export function round(n: number, digits = 0): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

/** Median interval between keystrokes, used to drive the metronome tempo. */
export function medianInterval(timestamps: number[]): number {
  if (timestamps.length < 3) return 0;
  const deltas: number[] = [];
  for (let i = 1; i < timestamps.length; i += 1) {
    const d = timestamps[i] - timestamps[i - 1];
    if (d > 0 && d < 2000) deltas.push(d);
  }
  if (!deltas.length) return 0;
  deltas.sort((a, b) => a - b);
  const mid = Math.floor(deltas.length / 2);
  return deltas.length % 2 ? deltas[mid] : (deltas[mid - 1] + deltas[mid]) / 2;
}

export function bpmFromInterval(intervalMs: number): number {
  if (intervalMs <= 0) return 0;
  return 60000 / intervalMs;
}
