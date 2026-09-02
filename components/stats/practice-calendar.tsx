"use client";

import { useMemo } from "react";
import { utcDayString } from "@/lib/typing/streak";

const WEEKS = 26;

function tint(count: number): string {
  if (count <= 0) return "var(--surface-2)";
  if (count === 1) return "color-mix(in srgb, var(--primary) 22%, var(--surface))";
  if (count <= 3) return "color-mix(in srgb, var(--primary) 45%, var(--surface))";
  return "color-mix(in srgb, var(--primary) 70%, var(--surface))";
}

export function PracticeCalendar({
  runDays,
}: {
  runDays: Record<string, number>;
}) {
  const columns = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    // Back up to the most recent Sunday.
    const end = new Date(today);
    end.setUTCDate(end.getUTCDate() - end.getUTCDay());

    const cols: { day: string; count: number }[][] = [];
    for (let w = WEEKS - 1; w >= 0; w -= 1) {
      const col: { day: string; count: number }[] = [];
      for (let d = 0; d < 7; d += 1) {
        const cell = new Date(end);
        cell.setUTCDate(end.getUTCDate() - w * 7 + d);
        const key = utcDayString(cell.getTime());
        col.push({ day: key, count: runDays[key] ?? 0 });
      }
      cols.push(col);
    }
    return cols;
  }, [runDays]);

  const active = Object.keys(runDays).length;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="mono-label">Practice calendar</span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-faint)]">
          {active} active {active === 1 ? "day" : "days"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-[3px]">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-[3px]">
              {col.map((cell) => (
                <span
                  key={cell.day}
                  title={`${cell.day}: ${cell.count} ${cell.count === 1 ? "run" : "runs"}`}
                  className="h-3 w-3 rounded-[2px] border border-[var(--border)]"
                  style={{ background: tint(cell.count) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
