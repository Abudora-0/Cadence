import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENTS,
  achievementById,
  evaluateUnlocks,
  type AchievementInput,
} from "./achievements";
import type { RunResult } from "./types";

function run(over: Partial<RunResult> = {}): RunResult {
  return {
    id: "r1",
    at: new Date(2026, 0, 15, 14, 0).getTime(), // local 2pm, deterministic
    mode: "time",
    configKey: "time:30",
    configLabel: "time 30s",
    wpm: 45,
    raw: 48,
    accuracy: 95,
    consistency: 70,
    durationSec: 30,
    chars: { correct: 100, incorrect: 4, extra: 0, missed: 0 },
    samples: [],
    keyStats: {},
    timeline: [],
    textLength: 104,
    ...over,
  };
}

function input(over: Partial<AchievementInput> = {}): AchievementInput {
  return {
    run: run(),
    totalRuns: 1,
    streakCurrent: 1,
    modesTried: ["time"],
    themesTried: ["midnight"],
    unlocked: {},
    ...over,
  };
}

describe("evaluateUnlocks", () => {
  it("gives first-run on the first finished run", () => {
    expect(evaluateUnlocks(input())).toContain("first-run");
  });

  it("never re-unlocks something already unlocked", () => {
    const got = evaluateUnlocks(input({ unlocked: { "first-run": 1 } }));
    expect(got).not.toContain("first-run");
  });

  it("unlocks the wpm tiers at or above the threshold only", () => {
    expect(evaluateUnlocks(input({ run: run({ wpm: 79 }) }))).not.toContain("wpm-80");
    expect(evaluateUnlocks(input({ run: run({ wpm: 80 }) }))).toContain("wpm-80");
    expect(evaluateUnlocks(input({ run: run({ wpm: 130 }) }))).toEqual(
      expect.arrayContaining(["wpm-60", "wpm-80", "wpm-100", "wpm-120"]),
    );
  });

  it("acc-100 needs a perfect run", () => {
    expect(evaluateUnlocks(input({ run: run({ accuracy: 99.9 }) }))).not.toContain("acc-100");
    expect(evaluateUnlocks(input({ run: run({ accuracy: 100 }) }))).toContain("acc-100");
  });

  it("acc-sub2 needs a real mistake, not a clean run", () => {
    const clean = run({ accuracy: 100, chars: { correct: 100, incorrect: 0, extra: 0, missed: 0 } });
    expect(evaluateUnlocks(input({ run: clean }))).not.toContain("acc-sub2");
    const nearClean = run({ accuracy: 99, chars: { correct: 99, incorrect: 1, extra: 0, missed: 0 } });
    expect(evaluateUnlocks(input({ run: nearClean }))).toContain("acc-sub2");
  });

  it("consistency-90 needs a run of 15 seconds or more", () => {
    expect(
      evaluateUnlocks(input({ run: run({ consistency: 95, durationSec: 10 }) })),
    ).not.toContain("consistency-90");
    expect(
      evaluateUnlocks(input({ run: run({ consistency: 95, durationSec: 20 }) })),
    ).toContain("consistency-90");
  });

  it("streak-7 gates on the current streak", () => {
    expect(evaluateUnlocks(input({ streakCurrent: 6 }))).not.toContain("streak-7");
    expect(evaluateUnlocks(input({ streakCurrent: 7 }))).toContain("streak-7");
  });

  it("all-modes needs every mode including custom", () => {
    const five = input({
      modesTried: ["time", "words", "quote", "code", "zen"],
    });
    expect(evaluateUnlocks(five)).not.toContain("all-modes");
    const six = input({
      modesTried: ["time", "words", "quote", "code", "zen", "custom"],
    });
    expect(evaluateUnlocks(six)).toContain("all-modes");
  });

  it("all-themes needs all five themes", () => {
    const four = input({
      themesTried: ["midnight", "paper", "terminal", "synthwave"],
    });
    expect(evaluateUnlocks(four)).not.toContain("all-themes");
    const five = input({
      themesTried: ["midnight", "paper", "terminal", "synthwave", "nord"],
    });
    expect(evaluateUnlocks(five)).toContain("all-themes");
  });

  it("night-owl fires only for a run between midnight and 4am", () => {
    const at2am = run({ at: new Date(2026, 0, 15, 2, 30).getTime() });
    expect(evaluateUnlocks(input({ run: at2am }))).toContain("night-owl");
    const at9am = run({ at: new Date(2026, 0, 15, 9, 0).getTime() });
    expect(evaluateUnlocks(input({ run: at9am }))).not.toContain("night-owl");
  });

  it("early-bird fires between 5 and 8am", () => {
    const at6am = run({ at: new Date(2026, 0, 15, 6, 0).getTime() });
    expect(evaluateUnlocks(input({ run: at6am }))).toContain("early-bird");
  });

  it("sharpshooter needs a drill run at 95 percent or better", () => {
    const wordsRun = run({ mode: "words", accuracy: 99 });
    expect(evaluateUnlocks(input({ run: wordsRun }))).not.toContain("sharpshooter");
    const weakDrill = run({ mode: "drill", accuracy: 96 });
    expect(evaluateUnlocks(input({ run: weakDrill }))).toContain("sharpshooter");
    const sloppyDrill = run({ mode: "drill", accuracy: 90 });
    expect(evaluateUnlocks(input({ run: sloppyDrill }))).not.toContain("sharpshooter");
  });
});

describe("ACHIEVEMENTS", () => {
  it("has unique ids and a lookup", () => {
    const ids = new Set(ACHIEVEMENTS.map((a) => a.id));
    expect(ids.size).toBe(ACHIEVEMENTS.length);
    expect(achievementById("first-run")?.label).toBe("First beat");
  });
});
