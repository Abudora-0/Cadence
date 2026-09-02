export interface Streak {
  current: number;
  longest: number;
  lastDay: string | null;
}

export const EMPTY_STREAK: Streak = { current: 0, longest: 0, lastDay: null };

/** UTC "YYYY-MM-DD" for a timestamp (or now). */
export function utcDayString(ms: number = Date.now()): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function dayNumber(day: string): number {
  return Math.floor(Date.parse(`${day}T00:00:00Z`) / 86_400_000);
}

/** Advance a streak given a run finished on `day` (UTC "YYYY-MM-DD"). */
export function nextStreak(prev: Streak, day: string): Streak {
  if (prev.lastDay === day) return prev;
  let current: number;
  if (prev.lastDay && dayNumber(day) - dayNumber(prev.lastDay) === 1) {
    current = prev.current + 1;
  } else {
    current = 1;
  }
  return {
    current,
    longest: Math.max(prev.longest, current),
    lastDay: day,
  };
}
