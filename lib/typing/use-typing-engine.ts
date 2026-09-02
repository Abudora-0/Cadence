"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  configKeyOf,
  configLabelOf,
  type KeyStat,
  type ModeConfig,
  type RunResult,
  type RunSample,
} from "./types";
import { buildWords, estimateWordCount } from "./words";
import { pickQuote } from "./quotes";
import { pickCodeSnippet } from "./code-snippets";
import { isUsableCustomText, tokenizeCustomText } from "./custom-text";
import {
  accuracyFrom,
  consistencyFrom,
  medianInterval,
  round,
  wpmFrom,
} from "./stats";

export type EngineStatus = "idle" | "running" | "finished";

export interface CharCell {
  char: string;
  state: "correct" | "incorrect" | "pending" | "extra";
}

export interface WordCell {
  chars: CharCell[];
  active: boolean;
  done: boolean;
  hadError: boolean;
}

export interface EngineSnapshot {
  status: EngineStatus;
  targetWords: string[];
  wordCells: WordCell[];
  wordIndex: number;
  caretOffset: number;
  progress: number;
  liveWpm: number;
  liveRaw: number;
  liveAcc: number;
  elapsedMs: number;
  remainingSec: number | null;
  samples: RunSample[];
  result: RunResult | null;
  lastEvent: { id: number; correct: boolean; kind: "char" | "space" | "back" } | null;
  keyIntervalMs: number;
  modeLabel: string;
  configKey: string;
}

interface EngineState {
  status: EngineStatus;
  targetWords: string[];
  typedWords: string[];
  wordIndex: number;
  startedAt: number | null;
  finishedAt: number | null;
  clock: number | null;
  samples: RunSample[];
  keyStats: Record<string, KeyStat>;
  keyTimes: number[];
  timeline: number[];
  maxAbsIndex: number;
  result: RunResult | null;
  lastEvent: EngineSnapshot["lastEvent"];
  tick: number;
}

function freshTarget(
  config: ModeConfig,
  seed?: number,
  customText = "",
): string[] {
  if (config.mode === "custom") {
    return isUsableCustomText(customText)
      ? tokenizeCustomText(customText)
      : buildWords({ ...config, mode: "words" }, 30, seed);
  }
  if (config.mode === "quote") {
    return pickQuote(undefined, seed).text.split(/\s+/).filter(Boolean);
  }
  if (config.mode === "code") {
    return pickCodeSnippet(config.codeLang, seed)
      .code.replace(/\n/g, " ↵ ")
      .split(/\s+/)
      .filter(Boolean);
  }
  if (config.mode === "zen") {
    return buildWords({ ...config, mode: "words" }, 60, seed);
  }
  return buildWords(config, estimateWordCount(config), seed);
}

function initialState(
  config: ModeConfig,
  seed?: number,
  customText = "",
): EngineState {
  return {
    status: "idle",
    targetWords: freshTarget(config, seed, customText),
    typedWords: [""],
    wordIndex: 0,
    startedAt: null,
    finishedAt: null,
    clock: null,
    samples: [],
    keyStats: {},
    keyTimes: [],
    timeline: [],
    maxAbsIndex: 0,
    result: null,
    lastEvent: null,
    tick: 0,
  };
}

function totalTargetChars(words: string[]): number {
  return words.reduce((a, w) => a + w.length, 0) + Math.max(0, words.length - 1);
}

function withKeyStat(
  stats: Record<string, KeyStat>,
  key: string,
  ok: boolean,
): Record<string, KeyStat> {
  const prev = stats[key] ?? { correct: 0, incorrect: 0 };
  return {
    ...stats,
    [key]: {
      correct: prev.correct + (ok ? 1 : 0),
      incorrect: prev.incorrect + (ok ? 0 : 1),
    },
  };
}

function advanceTimeline(state: EngineState): EngineState {
  const before = state.targetWords
    .slice(0, state.wordIndex)
    .reduce((a, w) => a + w.length + 1, 0);
  const typed = state.typedWords[state.wordIndex] ?? "";
  const cur = state.targetWords[state.wordIndex] ?? "";
  const abs = before + Math.min(typed.length, cur.length);
  if (abs <= state.maxAbsIndex) return state;

  const now = state.startedAt ? performance.now() - state.startedAt : 0;
  const timeline = state.timeline.slice();
  let maxAbsIndex = state.maxAbsIndex;
  while (maxAbsIndex < abs) {
    timeline.push(round(now));
    maxAbsIndex += 1;
  }
  return { ...state, timeline, maxAbsIndex };
}

function computeResult(
  state: EngineState,
  config: ModeConfig,
  configKey: string,
  modeLabel: string,
): RunResult {
  const now = performance.now();
  const startedAt = state.startedAt ?? now;
  const elapsedMs = Math.max(1, now - startedAt);

  let correct = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;

  for (let i = 0; i < state.targetWords.length; i += 1) {
    const target = state.targetWords[i];
    const typed = state.typedWords[i] ?? "";
    if (i > state.wordIndex && !typed) {
      if (i < state.targetWords.length) missed += 0;
      continue;
    }
    for (let j = 0; j < target.length; j += 1) {
      if (j < typed.length) {
        if (typed[j] === target[j]) correct += 1;
        else incorrect += 1;
      } else if (i < state.wordIndex) {
        missed += 1;
      }
    }
    if (typed.length > target.length) extra += typed.length - target.length;
    if (i < state.wordIndex && i < state.targetWords.length - 1) correct += 1;
  }

  const typedTotal = correct + incorrect + extra;
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
    mode: config.mode,
    configKey,
    configLabel: modeLabel,
    wpm: round(wpmFrom(correct, elapsedMs), 2),
    raw: round(wpmFrom(typedTotal, elapsedMs), 2),
    accuracy: round(accuracyFrom(correct, correct + incorrect + extra), 2),
    consistency: round(consistencyFrom(state.samples), 2),
    durationSec: round(elapsedMs / 1000, 1),
    chars: { correct, incorrect, extra, missed },
    samples: state.samples,
    keyStats: state.keyStats,
    timeline: state.timeline,
    textLength: totalTargetChars(state.targetWords),
    text: state.targetWords.join(" "),
    typed: state.typedWords.slice(0, state.wordIndex + 1).join(" "),
  };
}

interface EngineOpts {
  /** Locks the run to a fixed text (daily challenge). Skips randomisation. */
  seed?: number;
}

export function useTypingEngine(
  config: ModeConfig,
  customText = "",
  opts: EngineOpts = {},
) {
  const lockedSeed = opts.seed;
  const configKey = configKeyOf(config, customText);
  const modeLabel = configLabelOf(config);

  // The seed is fixed on the server and for the first client render so the
  // hydrated markup matches. A mount effect swaps in a random seed, and every
  // restart bumps it, which reshuffles the word list. When `lockedSeed` is set
  // the text stays fixed across mounts and restarts.
  const [seed, setSeed] = useState(lockedSeed ?? 0);

  const [state, setState] = useState<EngineState>(() =>
    initialState(config, lockedSeed ?? 0, customText),
  );
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (lockedSeed != null) return;
    const random = Math.floor(Math.random() * 0xffffffff) >>> 0;
    setSeed(random);
    setState(initialState(config, random, customText));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  // Reset the run whenever the configuration changes (React's blessed
  // "adjust state during render when a prop changes" pattern).
  const [prevKey, setPrevKey] = useState(configKey);
  if (prevKey !== configKey) {
    setPrevKey(configKey);
    setState(initialState(config, lockedSeed ?? seed, customText));
  }

  const restart = useCallback(() => {
    const next =
      lockedSeed ?? (Math.floor(Math.random() * 0xffffffff) >>> 0);
    setSeed(next);
    setState(initialState(config, next, customText));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey, lockedSeed]);

  const finalize = useCallback(() => {
    setState((prev) => {
      if (prev.status === "finished") return prev;
      return {
        ...prev,
        status: "finished",
        finishedAt: performance.now(),
        result: computeResult(prev, config, configKey, modeLabel),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey, modeLabel, config.mode, config.timeSec]);

  // Live per-second sampling and the time-mode countdown.
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = stateRef.current;
      if (s.status !== "running" || s.startedAt === null) return;
      const elapsedMs = performance.now() - s.startedAt;
      const second = Math.floor(elapsedMs / 1000);

      if (config.mode === "time" && elapsedMs >= config.timeSec * 1000) {
        finalize();
        return;
      }

      const nowPerf = performance.now();
      const last = s.samples[s.samples.length - 1];
      if (last && last.t >= second) {
        setState((prev) =>
          prev.status === "running" ? { ...prev, clock: nowPerf } : prev,
        );
        return;
      }

      let correct = 0;
      let typedTotal = 0;
      for (let i = 0; i <= s.wordIndex; i += 1) {
        const target = s.targetWords[i] ?? "";
        const typed = s.typedWords[i] ?? "";
        for (let j = 0; j < typed.length; j += 1) {
          typedTotal += 1;
          if (typed[j] === target[j]) correct += 1;
        }
        if (i < s.wordIndex) {
          correct += 1;
          typedTotal += 1;
        }
      }
      const sample: RunSample = {
        t: Math.max(1, second),
        wpm: round(wpmFrom(correct, elapsedMs), 1),
        raw: round(wpmFrom(typedTotal, elapsedMs), 1),
        acc: round(accuracyFrom(correct, typedTotal || 1), 1),
        errors: typedTotal - correct,
      };
      setState((prev) =>
        prev.status === "running"
          ? { ...prev, clock: nowPerf, samples: [...prev.samples, sample] }
          : prev,
      );
    }, 250);
    return () => window.clearInterval(id);
  }, [config.mode, config.timeSec, finalize]);

  const pressBackspace = useCallback((wholeWord = false) => {
    setState((prev) => {
      if (prev.status === "finished") return prev;
      const typedWords = prev.typedWords.slice();
      const current = typedWords[prev.wordIndex] ?? "";
      let wordIndex = prev.wordIndex;
      if (current.length > 0) {
        typedWords[prev.wordIndex] = wholeWord ? "" : current.slice(0, -1);
      } else if (prev.wordIndex > 0) {
        const prevTyped = typedWords[prev.wordIndex - 1] ?? "";
        const prevTarget = prev.targetWords[prev.wordIndex - 1] ?? "";
        if (prevTyped !== prevTarget) {
          wordIndex = prev.wordIndex - 1;
          if (wholeWord) typedWords[wordIndex] = "";
        }
      }
      return {
        ...prev,
        typedWords,
        wordIndex,
        lastEvent: { id: prev.tick + 1, correct: true, kind: "back" },
        tick: prev.tick + 1,
      };
    });
  }, []);

  const pressSpace = useCallback(() => {
    setState((prev) => {
      if (prev.status === "finished") return prev;
      const current = prev.typedWords[prev.wordIndex] ?? "";
      if (current.length === 0) return prev;

      const startedAt = prev.startedAt ?? performance.now();
      const target = prev.targetWords[prev.wordIndex] ?? "";
      const wordOk = current === target;
      const isFinal = prev.wordIndex >= prev.targetWords.length - 1;

      const base: EngineState = {
        ...prev,
        status: "running",
        startedAt,
        keyTimes: [...prev.keyTimes, performance.now()],
        keyStats: withKeyStat(prev.keyStats, "space", true),
      };

      if (isFinal && config.mode !== "time" && config.mode !== "zen") {
        return {
          ...base,
          status: "finished",
          finishedAt: performance.now(),
          result: computeResult(base, config, configKey, modeLabel),
        };
      }

      let targetWords = prev.targetWords;
      const wordIndex = prev.wordIndex + 1;
      const typedWords = prev.typedWords.slice();
      if (typedWords[wordIndex] === undefined) typedWords[wordIndex] = "";
      if (
        (config.mode === "time" || config.mode === "zen") &&
        wordIndex > targetWords.length - 12
      ) {
        targetWords = [
          ...targetWords,
          ...buildWords({ ...config, mode: "words" }, 40),
        ];
      }

      return advanceTimeline({
        ...base,
        targetWords,
        typedWords,
        wordIndex,
        lastEvent: { id: prev.tick + 1, correct: wordOk, kind: "space" },
        tick: prev.tick + 1,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.mode, configKey, modeLabel]);

  const pressChar = useCallback(
    (char: string) => {
      if (char.length !== 1) return;
      setState((prev) => {
        if (prev.status === "finished") return prev;
        const startedAt = prev.startedAt ?? performance.now();
        const current = prev.typedWords[prev.wordIndex] ?? "";
        const target = prev.targetWords[prev.wordIndex] ?? "";
        const expected = target[current.length];
        const ok = char === expected;

        const typedWords = prev.typedWords.slice();
        typedWords[prev.wordIndex] = current + char;

        const base: EngineState = {
          ...prev,
          status: "running",
          startedAt,
          typedWords,
          keyTimes: [...prev.keyTimes, performance.now()],
          keyStats:
            expected !== undefined
              ? withKeyStat(prev.keyStats, char.toLowerCase(), ok)
              : prev.keyStats,
          lastEvent: { id: prev.tick + 1, correct: ok, kind: "char" },
          tick: prev.tick + 1,
        };

        const advanced = advanceTimeline(base);
        const isFinal = advanced.wordIndex >= advanced.targetWords.length - 1;
        if (
          config.mode !== "time" &&
          config.mode !== "zen" &&
          isFinal &&
          (typedWords[advanced.wordIndex] ?? "").length >= target.length
        ) {
          return {
            ...advanced,
            status: "finished",
            finishedAt: performance.now(),
            result: computeResult(advanced, config, configKey, modeLabel),
          };
        }
        return advanced;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.mode, configKey, modeLabel],
  );

  /** Feed raw text (one or more characters) from a composed input event. */
  const pressText = useCallback(
    (text: string) => {
      for (const ch of text) {
        if (ch === " ") pressSpace();
        else pressChar(ch);
      }
    },
    [pressChar, pressSpace],
  );

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key;
      const isMod = e.ctrlKey || e.metaKey || e.altKey;
      if (isMod && key !== "Backspace") return;

      if (key === "Backspace") {
        e.preventDefault();
        pressBackspace(isMod);
        return;
      }
      if (
        key === " " ||
        key === "Spacebar" ||
        key === "Space" ||
        e.code === "Space"
      ) {
        e.preventDefault();
        pressSpace();
        return;
      }
      if (key.length !== 1) return;
      e.preventDefault();
      pressChar(key);
    },
    [pressBackspace, pressSpace, pressChar],
  );

  const finishZen = useCallback(() => {
    if (stateRef.current.status === "running") finalize();
  }, [finalize]);

  const snapshot = useMemo<EngineSnapshot>(() => {
    const wordCells: WordCell[] = state.targetWords.map((word, i) => {
      const typed = state.typedWords[i] ?? "";
      const chars: CharCell[] = [];
      const max = Math.max(word.length, typed.length);
      for (let j = 0; j < max; j += 1) {
        const t = word[j];
        const u = typed[j];
        if (t === undefined) chars.push({ char: u ?? "", state: "extra" });
        else if (u === undefined) chars.push({ char: t, state: "pending" });
        else chars.push({ char: t, state: u === t ? "correct" : "incorrect" });
      }
      return {
        chars,
        active: i === state.wordIndex && state.status !== "finished",
        done: i < state.wordIndex,
        hadError: i < state.wordIndex && typed !== word,
      };
    });

    let elapsedMs = 0;
    if (state.startedAt !== null) {
      const end =
        state.finishedAt ??
        (state.status === "running"
          ? Math.max(state.clock ?? state.startedAt, state.startedAt)
          : state.startedAt);
      elapsedMs = end - state.startedAt;
    }

    let liveCorrect = 0;
    let liveTyped = 0;
    for (let i = 0; i <= state.wordIndex; i += 1) {
      const target = state.targetWords[i] ?? "";
      const typed = state.typedWords[i] ?? "";
      for (let j = 0; j < typed.length; j += 1) {
        liveTyped += 1;
        if (typed[j] === target[j]) liveCorrect += 1;
      }
      if (i < state.wordIndex) {
        liveCorrect += 1;
        liveTyped += 1;
      }
    }

    const remainingSec =
      config.mode === "time"
        ? Math.max(0, config.timeSec - Math.floor(elapsedMs / 1000))
        : null;

    const denom = totalTargetChars(state.targetWords);

    return {
      status: state.status,
      targetWords: state.targetWords,
      wordCells,
      wordIndex: state.wordIndex,
      caretOffset: (state.typedWords[state.wordIndex] ?? "").length,
      progress: denom > 0 ? Math.min(1, state.maxAbsIndex / denom) : 0,
      liveWpm: round(wpmFrom(liveCorrect, elapsedMs || 1)),
      liveRaw: round(wpmFrom(liveTyped, elapsedMs || 1)),
      liveAcc: round(accuracyFrom(liveCorrect, liveTyped || 1)),
      elapsedMs,
      remainingSec,
      samples: state.samples,
      result: state.result,
      lastEvent: state.lastEvent,
      keyIntervalMs: medianInterval(state.keyTimes.slice(-24)),
      modeLabel,
      configKey,
    };
  }, [state, config.mode, config.timeSec, configKey, modeLabel]);

  return {
    snapshot,
    handleKey,
    pressText,
    pressBackspace,
    restart,
    finishZen,
  };
}
