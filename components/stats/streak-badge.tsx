"use client";

import type { Streak } from "@/lib/typing/streak";

export function StreakBadge({
  streak,
  totalDays,
}: {
  streak: Streak;
  totalDays: number;
}) {
  if (streak.current <= 0) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)] bg-[var(--primary-dim)] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text)]">
      <span aria-hidden>&#9650;</span>
      {streak.current} day streak
      <span className="text-[var(--text-faint)]">
        longest {streak.longest} · {totalDays} {totalDays === 1 ? "day" : "days"} total
      </span>
    </span>
  );
}
