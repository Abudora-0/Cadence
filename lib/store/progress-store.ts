"use client";

import { useEffect, useState } from "react";
import { get, set, del } from "idb-keyval";
import type { Mode, RunResult } from "@/lib/typing/types";
import type { ThemeId } from "@/lib/themes";
import { EMPTY_STREAK, nextStreak, utcDayString, type Streak } from "@/lib/typing/streak";
import { evaluateUnlocks } from "@/lib/typing/achievements";

const KEY = "cadence.progress.v1";

export interface DailyEntry {
  attempts: number;
  bestWpm: number;
  bestAcc: number;
  bestRunId: string;
}

export interface ProgressState {
  totalRuns: number;
  lastRunAt: number | null;
  runDays: Record<string, number>;
  streak: Streak;
  achievements: Record<string, number>;
  modesTried: Mode[];
  themesTried: ThemeId[];
  daily: Record<string, DailyEntry>;
}

export const EMPTY_PROGRESS: ProgressState = {
  totalRuns: 0,
  lastRunAt: null,
  runDays: {},
  streak: EMPTY_STREAK,
  achievements: {},
  modesTried: [],
  themesTried: [],
  daily: {},
};

type Listener = () => void;

let cache: ProgressState | null = null;
let loading: Promise<ProgressState> | null = null;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

function normalize(raw: unknown): ProgressState {
  if (!raw || typeof raw !== "object") return { ...EMPTY_PROGRESS };
  return { ...EMPTY_PROGRESS, ...(raw as Partial<ProgressState>) };
}

async function load(): Promise<ProgressState> {
  if (cache) return cache;
  if (!loading) {
    loading = get<ProgressState>(KEY)
      .then((rows) => {
        cache = normalize(rows);
        return cache;
      })
      .catch(() => {
        cache = { ...EMPTY_PROGRESS };
        return cache;
      });
  }
  return loading;
}

export interface RecordRunContext {
  theme: ThemeId;
  isDaily?: boolean;
  dailyDate?: string;
}

/** Folds a finished run into progress and returns newly unlocked achievement ids. */
export async function recordRun(
  run: RunResult,
  ctx: RecordRunContext,
): Promise<string[]> {
  const prev = await load();
  const day = utcDayString(run.at);

  const runDays = { ...prev.runDays, [day]: (prev.runDays[day] ?? 0) + 1 };
  const totalRuns = prev.totalRuns + 1;
  const streak = nextStreak(prev.streak, day);
  const modesTried = prev.modesTried.includes(run.mode)
    ? prev.modesTried
    : [...prev.modesTried, run.mode];
  const themesTried = prev.themesTried.includes(ctx.theme)
    ? prev.themesTried
    : [...prev.themesTried, ctx.theme];

  let daily = prev.daily;
  if (ctx.isDaily && ctx.dailyDate) {
    const cur = prev.daily[ctx.dailyDate] ?? {
      attempts: 0,
      bestWpm: 0,
      bestAcc: 0,
      bestRunId: "",
    };
    const better = run.wpm > cur.bestWpm;
    daily = {
      ...prev.daily,
      [ctx.dailyDate]: {
        attempts: cur.attempts + 1,
        bestWpm: Math.max(cur.bestWpm, run.wpm),
        bestAcc: Math.max(cur.bestAcc, run.accuracy),
        bestRunId: better ? run.id : cur.bestRunId,
      },
    };
  }

  const newly = evaluateUnlocks({
    run,
    totalRuns,
    streakCurrent: streak.current,
    modesTried,
    themesTried,
    unlocked: prev.achievements,
  });
  const achievements = { ...prev.achievements };
  for (const id of newly) achievements[id] = run.at;

  cache = {
    totalRuns,
    lastRunAt: run.at,
    runDays,
    streak,
    achievements,
    modesTried,
    themesTried,
    daily,
  };
  await set(KEY, cache);
  emit();
  return newly;
}

export async function clearProgress(): Promise<void> {
  cache = { ...EMPTY_PROGRESS };
  await del(KEY);
  emit();
}

export function useProgress(): { progress: ProgressState; ready: boolean } {
  const [progress, setProgress] = useState<ProgressState>(
    cache ?? EMPTY_PROGRESS,
  );
  const [ready, setReady] = useState(cache !== null);

  useEffect(() => {
    let active = true;
    const sync = () => {
      if (active) setProgress(cache ? { ...cache } : EMPTY_PROGRESS);
    };
    listeners.add(sync);
    void load().then(() => {
      if (!active) return;
      setProgress(cache ? { ...cache } : EMPTY_PROGRESS);
      setReady(true);
    });
    return () => {
      active = false;
      listeners.delete(sync);
    };
  }, []);

  return { progress, ready };
}
