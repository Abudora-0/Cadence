"use client";

import { motion, useReducedMotion } from "motion/react";
import { Sparkline } from "@/components/ui/sparkline";
import { THEMES } from "@/lib/themes";
import type { FeatureMotif } from "@/lib/content/features";

const loop = (reduce: boolean | null) =>
  reduce ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const };

export function FeatureMotifView({ motif }: { motif: FeatureMotif }) {
  const reduce = useReducedMotion();

  if (motif === "waveform") {
    return (
      <div className="flex h-14 items-center gap-[3px]">
        {Array.from({ length: 22 }).map((_, i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-[var(--primary)]"
            initial={{ height: 6 }}
            animate={
              reduce
                ? { height: 6 + (i % 5) * 4 }
                : { height: [6, 8 + ((i * 7) % 34), 6] }
            }
            transition={{
              ...loop(reduce),
              delay: (i % 6) * 0.12,
            }}
          />
        ))}
      </div>
    );
  }

  if (motif === "tempo") {
    return (
      <div className="relative flex h-14 items-center justify-center">
        <span className="absolute h-3 w-3 rounded-full bg-[var(--primary)]" />
        {[0, 0.5].map((d) => (
          <motion.span
            key={d}
            className="absolute h-3 w-3 rounded-full border border-[var(--primary)]"
            animate={reduce ? { opacity: 0.4 } : { scale: [1, 3.4], opacity: [0.8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: d * 1.6 }}
          />
        ))}
      </div>
    );
  }

  if (motif === "ghost") {
    return (
      <div className="relative h-14">
        <div className="tick-row absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 rounded-[var(--radius)] border border-[var(--border)]" />
        <motion.span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-50"
          animate={reduce ? { left: "62%" } : { left: ["4%", "84%"] }}
          transition={{ ...loop(reduce), duration: 3 }}
        />
        <motion.span
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[var(--primary)]"
          animate={reduce ? { left: "70%" } : { left: ["4%", "92%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    );
  }

  if (motif === "graph") {
    return (
      <div className="h-14">
        <Sparkline values={[22, 30, 27, 41, 38, 52, 47, 63, 58, 71]} height={56} />
      </div>
    );
  }

  if (motif === "heatmap") {
    const acc = [0.99, 0.94, 0.72, 0.88, 0.97, 0.6, 0.91, 0.98, 0.83];
    return (
      <div className="flex h-14 items-center gap-1.5">
        {acc.map((a, i) => (
          <motion.span
            key={i}
            className="h-7 w-7 rounded-[4px] border border-[var(--border)]"
            style={{
              background:
                a >= 0.95
                  ? "color-mix(in srgb, var(--primary) 45%, var(--surface))"
                  : a >= 0.8
                    ? "color-mix(in srgb, var(--warn) 30%, var(--surface))"
                    : "color-mix(in srgb, var(--incorrect) 40%, var(--surface))",
            }}
            initial={{ opacity: 0.4 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          />
        ))}
      </div>
    );
  }

  if (motif === "replay") {
    return (
      <div className="flex h-14 flex-col justify-center gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full border border-[var(--primary)] text-[0.5rem] text-[var(--primary)]">
            &#9654;
          </span>
          <div className="relative h-1 flex-1 rounded-full bg-[var(--surface-2)]">
            <motion.span
              className="absolute inset-y-0 left-0 rounded-full bg-[var(--primary)]"
              animate={reduce ? { width: "60%" } : { width: ["0%", "100%"] }}
              transition={{ ...loop(reduce), duration: 3, ease: "linear" }}
            />
            <motion.span
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-[var(--primary)] bg-[var(--surface)]"
              animate={reduce ? { left: "60%" } : { left: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (motif === "themes") {
    return (
      <div className="flex h-14 items-center gap-2">
        {THEMES.map((t, i) => (
          <motion.span
            key={t.id}
            className="flex gap-1 rounded-[4px] border border-[var(--border)] p-1"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            {t.swatch.map((c, j) => (
              <span
                key={j}
                className="h-3.5 w-3.5 rounded-[2px]"
                style={{ background: c }}
              />
            ))}
          </motion.span>
        ))}
      </div>
    );
  }

  // local
  return (
    <div className="flex h-14 items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-[var(--radius)] border border-[var(--border-strong)] text-[var(--primary)]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--text-faint)]">
        localStorage
        <br />
        IndexedDB
      </span>
    </div>
  );
}
