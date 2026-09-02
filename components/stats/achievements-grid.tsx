"use client";

import clsx from "clsx";
import { ACHIEVEMENTS } from "@/lib/typing/achievements";
import { Reveal } from "@/components/ui/reveal";

export function AchievementsGrid({
  unlocked,
}: {
  unlocked: Record<string, number>;
}) {
  const count = Object.keys(unlocked).length;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="mono-label">Achievements</span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-faint)]">
          {count} / {ACHIEVEMENTS.length}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a, i) => {
          const at = unlocked[a.id];
          const got = at !== undefined;
          return (
            <Reveal
              key={a.id}
              delay={(i % 3) * 50}
              className={clsx(
                "flex flex-col gap-1 rounded-[var(--radius-lg)] border p-3",
                got
                  ? "border-[var(--primary)] bg-[var(--primary-dim)]"
                  : "border-[var(--border)] opacity-55",
              )}
            >
              <span
                className={clsx(
                  "text-sm font-semibold",
                  got ? "text-[var(--text)]" : "text-[var(--text-dim)]",
                )}
              >
                {a.label}
              </span>
              <span className="text-[0.72rem] leading-relaxed text-[var(--text-dim)]">
                {a.blurb}
              </span>
              <span className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                {got
                  ? new Date(at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : a.group}
              </span>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
