"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import clsx from "clsx";
import { clearHistory, summarize, useHistory } from "@/lib/store/history-store";
import { clearProgress, useProgress } from "@/lib/store/progress-store";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Sparkline } from "@/components/ui/sparkline";
import { AchievementsGrid } from "./achievements-grid";
import { PracticeCalendar } from "./practice-calendar";
import { StreakBadge } from "./streak-badge";
import type { RunResult } from "@/lib/typing/types";

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function bestByConfig(runs: RunResult[]): { label: string; run: RunResult }[] {
  const map = new Map<string, RunResult>();
  for (const r of runs) {
    const prev = map.get(r.configKey);
    if (!prev || r.wpm > prev.wpm) map.set(r.configKey, r);
  }
  return [...map.values()]
    .sort((a, b) => b.wpm - a.wpm)
    .map((run) => ({ label: run.configLabel, run }));
}

function Tile({
  label,
  value,
  decimals = 0,
  suffix,
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
}) {
  return (
    <div className="panel flex flex-col gap-2 p-4">
      <span className="mono-label">{label}</span>
      <span
        className="text-2xl font-semibold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
      </span>
    </div>
  );
}

function ClearButton({
  label,
  confirming,
  onArm,
  onCancel,
  onConfirm,
}: {
  label: string;
  confirming: boolean;
  onArm: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!confirming) {
    return (
      <button
        type="button"
        onClick={onArm}
        className="rounded-[var(--radius)] border border-[var(--border-strong)] px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--text-faint)] transition-colors hover:border-[var(--danger)] hover:text-[var(--danger)]"
      >
        {label}
      </button>
    );
  }
  return (
    <span className="flex items-center gap-3">
      <button
        type="button"
        onClick={onConfirm}
        className="rounded-[var(--radius)] border border-[var(--danger)] px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--danger)]"
      >
        Confirm delete
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--text-faint)]"
      >
        cancel
      </button>
    </span>
  );
}

export function StatsView() {
  const { runs, ready } = useHistory();
  const { progress } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const [confirmingProgress, setConfirmingProgress] = useState(false);

  const summary = useMemo(() => summarize(runs), [runs]);
  const progression = useMemo(
    () => [...runs].reverse().slice(-40).map((r) => r.wpm),
    [runs],
  );
  const bests = useMemo(() => bestByConfig(runs), [runs]);

  if (!ready) {
    return (
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[var(--text-faint)]">
        reading local history
      </p>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="panel flex flex-col items-center gap-3 p-12 text-center">
        <span className="mono-label">No runs yet</span>
        <p className="max-w-sm text-sm text-[var(--text-dim)]">
          Finish a session on the practice page and it lands here. History is kept
          in your browser, never uploaded.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="mono-label">Your record</span>
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Stats
        </h1>
        <StreakBadge
          streak={progress.streak}
          totalDays={Object.keys(progress.runDays).length}
        />
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Tile label="Runs" value={summary.totalRuns} />
        <div className="panel flex flex-col gap-2 p-4">
          <span className="mono-label">Time typed</span>
          <span
            className="text-2xl font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatDuration(summary.totalSeconds)}
          </span>
        </div>
        <Tile label="Best WPM" value={summary.bestWpm} />
        <Tile label="Avg WPM" value={summary.avgWpm} decimals={1} />
        <Tile label="Avg accuracy" value={summary.avgAccuracy} decimals={1} suffix="%" />
      </div>

      <section className="panel flex flex-col gap-4 p-5">
        <span className="mono-label">WPM progression / last {progression.length} runs</span>
        <Sparkline values={progression} height={120} />
      </section>

      {bests.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className="mono-label">Personal bests by mode</span>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bests.map(({ label, run }) => {
              const inner = (
                <>
                  <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--text-dim)]">
                    {label}
                  </span>
                  <span className="text-lg font-semibold text-[var(--primary)]">
                    {Math.round(run.wpm)}
                    <span className="ml-1 text-[0.6rem] tracking-widest opacity-60">
                      wpm
                    </span>
                  </span>
                </>
              );
              return run.text ? (
                <motion.div
                  key={run.configKey}
                  whileHover={{ y: -3, borderColor: "var(--border-strong)" }}
                >
                  <Link
                    href={`/practice/replay/${run.id}`}
                    className="panel flex items-center justify-between p-4"
                  >
                    {inner}
                  </Link>
                </motion.div>
              ) : (
                <div
                  key={run.configKey}
                  className="panel flex items-center justify-between p-4"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <span className="mono-label">Recent runs</span>
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border)] font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                <th className="px-4 py-3 font-normal">When</th>
                <th className="px-4 py-3 font-normal">Mode</th>
                <th className="px-4 py-3 font-normal">WPM</th>
                <th className="px-4 py-3 font-normal">Acc</th>
                <th className="px-4 py-3 font-normal">Consistency</th>
                <th className="px-3 py-3 font-normal" />
              </tr>
            </thead>
            <tbody>
              {runs.slice(0, 25).map((r) => (
                <tr
                  key={r.id}
                  className={clsx(
                    "border-b border-[var(--border)] text-sm last:border-0",
                    r.text && "transition-colors hover:bg-[var(--surface-2)]",
                  )}
                >
                  <td className="px-4 py-3 font-mono text-[0.72rem] text-[var(--text-faint)]">
                    {new Date(r.at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--text-dim)]">
                    {r.configLabel}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--primary)]">
                    {Math.round(r.wpm)}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-dim)]">
                    {r.accuracy.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-[var(--text-dim)]">
                    {Math.round(r.consistency)}%
                  </td>
                  <td className="px-3 py-3 text-right">
                    {r.text ? (
                      <Link
                        href={`/practice/replay/${r.id}`}
                        className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text-faint)] transition-colors hover:text-[var(--primary)]"
                      >
                        watch
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <PracticeCalendar runDays={progress.runDays} />

      <AchievementsGrid unlocked={progress.achievements} />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <ClearButton
          label="Clear history"
          confirming={confirming}
          onArm={() => setConfirming(true)}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            void clearHistory();
            setConfirming(false);
          }}
        />
        <ClearButton
          label="Clear progress"
          confirming={confirmingProgress}
          onArm={() => setConfirmingProgress(true)}
          onCancel={() => setConfirmingProgress(false)}
          onConfirm={() => {
            void clearProgress();
            setConfirmingProgress(false);
          }}
        />
      </div>
    </div>
  );
}
