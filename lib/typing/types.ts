import { seededFrom } from "./rng";

export type Mode =
  | "time"
  | "words"
  | "quote"
  | "code"
  | "zen"
  | "custom"
  | "drill";

export type Language =
  | "english"
  | "english-1k"
  | "spanish"
  | "french"
  | "german"
  | "italian"
  | "portuguese"
  | "roman-urdu";
export type CodeLang = "javascript" | "python";

export interface ModeConfig {
  mode: Mode;
  timeSec: number;
  wordCount: number;
  language: Language;
  codeLang: CodeLang;
  punctuation: boolean;
  numbers: boolean;
}

export const DEFAULT_MODE_CONFIG: ModeConfig = {
  mode: "time",
  timeSec: 30,
  wordCount: 25,
  language: "english",
  codeLang: "javascript",
  punctuation: false,
  numbers: false,
};

export const TIME_OPTIONS = [15, 30, 60, 120] as const;
export const WORD_OPTIONS = [10, 25, 50, 100] as const;

export interface RunSample {
  /** whole seconds since start */
  t: number;
  wpm: number;
  raw: number;
  acc: number;
  errors: number;
}

export interface KeyStat {
  correct: number;
  incorrect: number;
}

export interface RunChars {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
}

export interface RunResult {
  id: string;
  at: number;
  mode: Mode;
  configKey: string;
  configLabel: string;
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  durationSec: number;
  chars: RunChars;
  samples: RunSample[];
  keyStats: Record<string, KeyStat>;
  /** ms offset at which the caret first passed each character index */
  timeline: number[];
  textLength: number;
  /** The full target text and what was typed. Added later, so older runs
   *  in history will not have these and cannot be replayed. */
  text?: string;
  typed?: string;
}

export function configKeyOf(config: ModeConfig, customText?: string): string {
  if (config.mode === "custom") {
    const t = (customText ?? "").trim();
    return `custom:${t ? seededFrom(t).toString(36) : "0"}`;
  }
  const parts: string[] = [config.mode];
  if (config.mode === "time") parts.push(String(config.timeSec));
  if (config.mode === "words") parts.push(String(config.wordCount));
  if (config.mode === "code") parts.push(config.codeLang);
  if (config.mode === "drill") parts.push(config.language);
  if (config.mode === "time" || config.mode === "words") {
    parts.push(config.language);
    parts.push(config.punctuation ? "p1" : "p0");
    parts.push(config.numbers ? "n1" : "n0");
  }
  return parts.join(":");
}

export function configLabelOf(config: ModeConfig): string {
  switch (config.mode) {
    case "time":
      return `time ${config.timeSec}s`;
    case "words":
      return `words ${config.wordCount}`;
    case "quote":
      return "quote";
    case "code":
      return `code ${config.codeLang}`;
    case "zen":
      return "zen";
    case "custom":
      return "custom";
    case "drill":
      return "weak keys";
  }
}
