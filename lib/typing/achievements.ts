import type { Mode, RunResult } from "./types";
import type { ThemeId } from "@/lib/themes";
import { THEMES } from "@/lib/themes";

export interface AchievementDef {
  id: string;
  label: string;
  blurb: string;
  group: "Milestones" | "Speed" | "Precision" | "Habit" | "Explorer";
}

export interface AchievementInput {
  run: RunResult;
  /** Total finished runs, including this one. */
  totalRuns: number;
  streakCurrent: number;
  modesTried: Mode[];
  themesTried: ThemeId[];
  unlocked: Record<string, number>;
}

const ALL_MODES: Mode[] = ["time", "words", "quote", "code", "zen", "custom"];
const ALL_THEMES = THEMES.map((t) => t.id);

interface Rule extends AchievementDef {
  met: (i: AchievementInput) => boolean;
}

const RULES: Rule[] = [
  {
    id: "first-run",
    label: "First beat",
    blurb: "Finish your first run.",
    group: "Milestones",
    met: (i) => i.totalRuns >= 1,
  },
  {
    id: "runs-10",
    label: "Warmed up",
    blurb: "Finish 10 runs.",
    group: "Milestones",
    met: (i) => i.totalRuns >= 10,
  },
  {
    id: "runs-50",
    label: "In the groove",
    blurb: "Finish 50 runs.",
    group: "Milestones",
    met: (i) => i.totalRuns >= 50,
  },
  {
    id: "runs-100",
    label: "Regular",
    blurb: "Finish 100 runs.",
    group: "Milestones",
    met: (i) => i.totalRuns >= 100,
  },
  {
    id: "runs-500",
    label: "Session 500",
    blurb: "Finish 500 runs.",
    group: "Milestones",
    met: (i) => i.totalRuns >= 500,
  },
  {
    id: "wpm-60",
    label: "Cruising",
    blurb: "Hit 60 wpm in a single run.",
    group: "Speed",
    met: (i) => i.run.wpm >= 60,
  },
  {
    id: "wpm-80",
    label: "Quick hands",
    blurb: "Hit 80 wpm in a single run.",
    group: "Speed",
    met: (i) => i.run.wpm >= 80,
  },
  {
    id: "wpm-100",
    label: "Triple digits",
    blurb: "Hit 100 wpm in a single run.",
    group: "Speed",
    met: (i) => i.run.wpm >= 100,
  },
  {
    id: "wpm-120",
    label: "Blur",
    blurb: "Hit 120 wpm in a single run.",
    group: "Speed",
    met: (i) => i.run.wpm >= 120,
  },
  {
    id: "acc-100",
    label: "Flawless",
    blurb: "Finish a run with 100 percent accuracy.",
    group: "Precision",
    met: (i) => i.run.accuracy >= 100,
  },
  {
    id: "acc-sub2",
    label: "Barely a wobble",
    blurb: "Finish at 98 percent or better with at least one real mistake.",
    group: "Precision",
    met: (i) => i.run.accuracy >= 98 && i.run.chars.incorrect > 0,
  },
  {
    id: "consistency-90",
    label: "Metronome",
    blurb: "Score 90 consistency on a run of 15 seconds or more.",
    group: "Precision",
    met: (i) => i.run.consistency >= 90 && i.run.durationSec >= 15,
  },
  {
    id: "marathon",
    label: "Long haul",
    blurb: "Finish a run of two minutes or more.",
    group: "Precision",
    met: (i) => i.run.durationSec >= 120,
  },
  {
    id: "streak-7",
    label: "Seven days",
    blurb: "Practice on seven days in a row.",
    group: "Habit",
    met: (i) => i.streakCurrent >= 7,
  },
  {
    id: "streak-30",
    label: "A month of it",
    blurb: "Practice on thirty days in a row.",
    group: "Habit",
    met: (i) => i.streakCurrent >= 30,
  },
  {
    id: "night-owl",
    label: "Night owl",
    blurb: "Finish a run between midnight and 4am.",
    group: "Habit",
    met: (i) => {
      const h = new Date(i.run.at).getHours();
      return h >= 0 && h < 4;
    },
  },
  {
    id: "early-bird",
    label: "Early bird",
    blurb: "Finish a run between 5am and 8am.",
    group: "Habit",
    met: (i) => {
      const h = new Date(i.run.at).getHours();
      return h >= 5 && h < 8;
    },
  },
  {
    id: "sharpshooter",
    label: "Sharpshooter",
    blurb: "Finish a weak-key drill at 95 percent or better.",
    group: "Precision",
    met: (i) => i.run.mode === "drill" && i.run.accuracy >= 95,
  },
  {
    id: "all-modes",
    label: "Full kit",
    blurb: "Try every practice mode, including custom text.",
    group: "Explorer",
    met: (i) => ALL_MODES.every((m) => i.modesTried.includes(m)),
  },
  {
    id: "all-themes",
    label: "Interior decorator",
    blurb: "Practice in all five themes.",
    group: "Explorer",
    met: (i) => ALL_THEMES.every((t) => i.themesTried.includes(t)),
  },
];

export const ACHIEVEMENTS: AchievementDef[] = RULES.map(
  ({ id, label, blurb, group }) => ({ id, label, blurb, group }),
);

export function achievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/** Returns the ids newly satisfied by this run (not already unlocked). */
export function evaluateUnlocks(input: AchievementInput): string[] {
  return RULES.filter(
    (rule) => !(rule.id in input.unlocked) && rule.met(input),
  ).map((rule) => rule.id);
}
