import { DEFAULT_MODE_CONFIG, type ModeConfig } from "./types";
import { buildWords } from "./words";
import { seededFrom } from "./rng";
import { utcDayString } from "./streak";

export { utcDayString };

/** Everyone gets the same 50 word run per UTC day. */
export const DAILY_CONFIG: ModeConfig = {
  ...DEFAULT_MODE_CONFIG,
  mode: "words",
  wordCount: 50,
  language: "english-1k",
  punctuation: true,
  numbers: false,
};

export function dailySeed(dayStr: string): number {
  return seededFrom(`cadence-daily-${dayStr}`);
}

export function dailyTargetWords(dayStr: string): string[] {
  return buildWords(DAILY_CONFIG, DAILY_CONFIG.wordCount, dailySeed(dayStr));
}

export function dailyConfigKey(dayStr: string): string {
  return `daily:${dayStr}`;
}
