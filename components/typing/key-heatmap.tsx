"use client";

import { motion } from "motion/react";
import type { KeyStat } from "@/lib/typing/types";

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

interface KeyHeatmapProps {
  keyStats: Record<string, KeyStat>;
}

function accuracy(stat: KeyStat | undefined): number | null {
  if (!stat) return null;
  const total = stat.correct + stat.incorrect;
  if (total === 0) return null;
  return stat.correct / total;
}

function tint(acc: number | null): string {
  if (acc === null) return "var(--surface-2)";
  if (acc >= 0.98) return "color-mix(in srgb, var(--primary) 55%, var(--surface))";
  if (acc >= 0.92) return "color-mix(in srgb, var(--primary) 30%, var(--surface))";
  if (acc >= 0.82) return "color-mix(in srgb, var(--warn) 32%, var(--surface))";
  return "color-mix(in srgb, var(--incorrect) 42%, var(--surface))";
}

export function KeyHeatmap({ keyStats }: KeyHeatmapProps) {
  const worst = Object.entries(keyStats)
    .map(([k, v]) => ({ k, acc: accuracy(v), total: v.correct + v.incorrect }))
    .filter((e) => e.acc !== null && e.k.length === 1 && e.total >= 2)
    .sort((a, b) => (a.acc ?? 1) - (b.acc ?? 1))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-3">
      <span className="mono-label">Per-key accuracy</span>
      <div className="flex flex-col items-center gap-1">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1" style={{ paddingLeft: ri * 14 }}>
            {row.split("").map((ch) => {
              const acc = accuracy(keyStats[ch]);
              return (
                <motion.span
                  key={ch}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.02 * (ch.charCodeAt(0) % 12) }}
                  className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-[var(--border)] font-mono text-[0.7rem] uppercase text-[var(--text-dim)]"
                  style={{ background: tint(acc) }}
                  title={acc === null ? `${ch}: untested` : `${ch}: ${Math.round(acc * 100)}%`}
                >
                  {ch}
                </motion.span>
              );
            })}
          </div>
        ))}
      </div>
      {worst.length > 0 && (
        <p className="text-center font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-faint)]">
          Shaky keys:{" "}
          {worst.map((w, i) => (
            <span key={w.k} className="text-[var(--incorrect)]">
              {w.k}
              {i < worst.length - 1 ? " , " : ""}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
