"use client";

import { motion } from "motion/react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import type { EngineSnapshot } from "@/lib/typing/use-typing-engine";

interface RunHudProps {
  snapshot: EngineSnapshot;
  bestWpm: number | null;
}

function Stat({
  label,
  value,
  decimals = 0,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="mono-label">{label}</span>
      <span
        className="text-[2.1rem] font-semibold leading-none"
        style={{
          fontFamily: "var(--font-display)",
          color: accent ? "var(--primary)" : "var(--text)",
        }}
      >
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
      </span>
    </div>
  );
}

export function RunHud({ snapshot, bestWpm }: RunHudProps) {
  const showTimer = snapshot.remainingSec !== null;

  return (
    <motion.div
      layout
      className="flex flex-wrap items-end gap-x-10 gap-y-4"
    >
      {showTimer && (
        <Stat label="Time left" value={snapshot.remainingSec ?? 0} suffix="s" accent />
      )}
      {!showTimer && (
        <Stat
          label="Elapsed"
          value={snapshot.elapsedMs / 1000}
          decimals={1}
          suffix="s"
          accent
        />
      )}
      <Stat label="WPM" value={snapshot.liveWpm} />
      <Stat label="Accuracy" value={snapshot.liveAcc} suffix="%" />
      <div className="flex flex-col gap-1">
        <span className="mono-label">Progress</span>
        <div className="mt-2 h-2 w-32 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <motion.div
            className="h-full rounded-full bg-[var(--primary)]"
            animate={{ width: `${Math.round(snapshot.progress * 100)}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </div>
      </div>
      {bestWpm != null && bestWpm > 0 && (
        <div className="flex flex-col gap-1">
          <span className="mono-label">Your best</span>
          <span className="font-mono text-sm text-[var(--accent)]">{Math.round(bestWpm)} wpm</span>
        </div>
      )}
    </motion.div>
  );
}
