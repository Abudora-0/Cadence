"use client";

import { useEffect, useState } from "react";
import { get, set, del } from "idb-keyval";
import type { RunResult } from "@/lib/typing/types";

const KEY = "cadence.history.v1";
const MAX_RUNS = 400;

type Listener = () => void;

let cache: RunResult[] | null = null;
let loading: Promise<RunResult[]> | null = null;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

async function load(): Promise<RunResult[]> {
  if (cache) return cache;
  if (!loading) {
    loading = get<RunResult[]>(KEY)
      .then((rows) => {
        cache = Array.isArray(rows) ? rows : [];
        return cache;
      })
      .catch(() => {
        cache = [];
        return cache;
      });
  }
  return loading;
}

export async function addRun(run: RunResult): Promise<void> {
  const rows = await load();
  cache = [run, ...rows].slice(0, MAX_RUNS);
  await set(KEY, cache);
  emit();
}

export async function clearHistory(): Promise<void> {
  cache = [];
  await del(KEY);
  emit();
}

export function bestForConfig(
  rows: RunResult[],
  configKey: string,
): RunResult | null {
  let best: RunResult | null = null;
  for (const r of rows) {
    if (r.configKey !== configKey) continue;
    if (!best || r.wpm > best.wpm) best = r;
  }
  return best;
}

export interface HistorySummary {
  totalRuns: number;
  totalSeconds: number;
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
}

export function summarize(rows: RunResult[]): HistorySummary {
  if (!rows.length) {
    return {
      totalRuns: 0,
      totalSeconds: 0,
      bestWpm: 0,
      avgWpm: 0,
      avgAccuracy: 0,
    };
  }
  const totalSeconds = rows.reduce((a, r) => a + r.durationSec, 0);
  const bestWpm = rows.reduce((a, r) => Math.max(a, r.wpm), 0);
  const avgWpm = rows.reduce((a, r) => a + r.wpm, 0) / rows.length;
  const avgAccuracy = rows.reduce((a, r) => a + r.accuracy, 0) / rows.length;
  return {
    totalRuns: rows.length,
    totalSeconds,
    bestWpm,
    avgWpm,
    avgAccuracy,
  };
}

export function useHistory(): {
  runs: RunResult[];
  ready: boolean;
} {
  const [runs, setRuns] = useState<RunResult[]>(cache ?? []);
  const [ready, setReady] = useState(cache !== null);

  useEffect(() => {
    let active = true;
    const sync = () => {
      if (active) setRuns(cache ? [...cache] : []);
    };
    listeners.add(sync);
    void load().then(() => {
      if (!active) return;
      setRuns(cache ? [...cache] : []);
      setReady(true);
    });
    return () => {
      active = false;
      listeners.delete(sync);
    };
  }, []);

  return { runs, ready };
}
