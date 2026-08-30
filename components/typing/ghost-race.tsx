"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import clsx from "clsx";
import type { RunResult } from "@/lib/typing/types";
import { CadenceLogo } from "@/components/logo/cadence-logo";

interface GhostRaceProps {
  ghost: RunResult | null;
  elapsedMs: number;
  progress: number;
  running: boolean;
}

export function GhostRace({ ghost, elapsedMs, progress, running }: GhostRaceProps) {
  const ghostProgress = useMemo(() => {
    if (!ghost || ghost.timeline.length === 0) return 0;
    let lo = 0;
    let hi = ghost.timeline.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (ghost.timeline[mid] <= elapsedMs) lo = mid + 1;
      else hi = mid;
    }
    return Math.min(1, lo / Math.max(1, ghost.textLength));
  }, [ghost, elapsedMs]);

  if (!ghost) {
    return (
      <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--text-faint)]">
        <span className="h-1 w-1 rounded-full bg-[var(--border-strong)]" />
        No ghost yet for this mode. Finish a run to set one.
      </div>
    );
  }

  const lead = progress - ghostProgress;
  const status =
    !running && progress === 0
      ? `Racing your ${Math.round(ghost.wpm)} wpm ghost`
      : lead >= 0
        ? `Ahead by ${Math.round(lead * ghost.textLength)} chars`
        : `Behind by ${Math.round(-lead * ghost.textLength)} chars`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.18em]">
        <span className="text-[var(--text-faint)]">Ghost race</span>
        <span className={clsx(lead >= 0 ? "text-[var(--primary)]" : "text-[var(--warn)]")}>
          {status}
        </span>
      </div>
      <div className="relative h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] tick-row">
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 opacity-40"
          animate={{ left: `calc(${(ghostProgress * 100).toFixed(2)}% - 10px)` }}
          transition={{ ease: "linear", duration: 0.2 }}
        >
          <CadenceLogo size={18} animated={false} />
        </motion.div>
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          animate={{ left: `calc(${(progress * 100).toFixed(2)}% - 11px)` }}
          transition={{ type: "spring", stiffness: 180, damping: 26 }}
        >
          <CadenceLogo size={22} animated={running} />
        </motion.div>
      </div>
    </div>
  );
}
