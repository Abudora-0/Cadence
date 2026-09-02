"use client";

import { motion } from "motion/react";
import clsx from "clsx";
import type { RunResult } from "@/lib/typing/types";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { SpeedGraph } from "./speed-graph";
import { KeyHeatmap } from "./key-heatmap";

interface ResultsCardProps {
  result: RunResult;
  previousBest: number | null;
  onNext: () => void;
  onRepeat: () => void;
  nextLabel?: string;
  repeatLabel?: string;
  hint?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 26 } },
};

function BigStat({
  label,
  value,
  decimals = 0,
  suffix,
  primary,
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  primary?: boolean;
}) {
  return (
    <motion.div variants={item} className="flex flex-col gap-1">
      <span className="mono-label">{label}</span>
      <span
        className={clsx("text-[2.6rem] font-semibold leading-none")}
        style={{
          fontFamily: "var(--font-display)",
          color: primary ? "var(--primary)" : "var(--text)",
        }}
      >
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
      </span>
    </motion.div>
  );
}

export function ResultsCard({
  result,
  previousBest,
  onNext,
  onRepeat,
  nextLabel = "Next run",
  repeatLabel = "Repeat",
  hint = "press Tab to restart",
}: ResultsCardProps) {
  const isRecord =
    previousBest !== null && result.wpm > previousBest && previousBest > 0;
  const { chars } = result;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="panel relative flex flex-col gap-8 p-6 sm:p-8"
    >
      {isRecord && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-3 left-6 rounded-full border border-[var(--primary)] bg-[var(--bg)] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--primary)] glow-text"
        >
          New personal best
        </motion.div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-wrap items-end gap-x-10 gap-y-5">
          <BigStat label="WPM" value={result.wpm} primary />
          <BigStat label="Accuracy" value={result.accuracy} decimals={1} suffix="%" />
          <BigStat label="Raw" value={result.raw} />
          <BigStat label="Consistency" value={result.consistency} decimals={0} suffix="%" />
        </div>
        <motion.div variants={item} className="flex flex-col items-end gap-1 font-mono text-[0.7rem] text-[var(--text-faint)]">
          <span className="uppercase tracking-[0.18em]">{result.configLabel}</span>
          <span>{result.durationSec}s run</span>
          {previousBest != null && previousBest > 0 && (
            <span className="text-[var(--accent)]">prev best {Math.round(previousBest)}</span>
          )}
        </motion.div>
      </div>

      <motion.div variants={item} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3">
        <SpeedGraph samples={result.samples} compareWpm={previousBest} height={190} />
      </motion.div>

      <div className="grid gap-8 sm:grid-cols-[1fr_auto]">
        <motion.div variants={item} className="flex flex-wrap gap-x-8 gap-y-3">
          {[
            { label: "Correct", value: chars.correct, color: "var(--primary)" },
            { label: "Incorrect", value: chars.incorrect, color: "var(--incorrect)" },
            { label: "Extra", value: chars.extra, color: "var(--warn)" },
            { label: "Missed", value: chars.missed, color: "var(--text-faint)" },
          ].map((c) => (
            <div key={c.label} className="flex flex-col gap-1">
              <span className="mono-label">{c.label}</span>
              <span className="text-lg font-semibold" style={{ color: c.color }}>
                {c.value}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div variants={item}>
          <KeyHeatmap keyStats={result.keyStats} />
        </motion.div>
      </div>

      <motion.div variants={item} className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onNext}
          className="rounded-[var(--radius)] bg-[var(--primary)] px-5 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--primary-ink)] transition-transform hover:-translate-y-0.5"
        >
          {nextLabel}
        </button>
        <button
          type="button"
          onClick={onRepeat}
          className="rounded-[var(--radius)] border border-[var(--border-strong)] px-5 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
        >
          {repeatLabel}
        </button>
        {hint && (
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-faint)]">
            {hint}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
