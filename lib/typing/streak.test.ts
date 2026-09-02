import { describe, expect, it } from "vitest";
import { EMPTY_STREAK, nextStreak, utcDayString } from "./streak";

describe("utcDayString", () => {
  it("formats a timestamp as a UTC day", () => {
    expect(utcDayString(Date.parse("2026-03-14T23:59:00Z"))).toBe("2026-03-14");
    expect(utcDayString(Date.parse("2026-03-15T00:01:00Z"))).toBe("2026-03-15");
  });
});

describe("nextStreak", () => {
  it("starts a streak at 1 on the first run", () => {
    expect(nextStreak(EMPTY_STREAK, "2026-01-10")).toEqual({
      current: 1,
      longest: 1,
      lastDay: "2026-01-10",
    });
  });

  it("does not change for a second run on the same day", () => {
    const a = nextStreak(EMPTY_STREAK, "2026-01-10");
    expect(nextStreak(a, "2026-01-10")).toBe(a);
  });

  it("increments across consecutive days", () => {
    let s = nextStreak(EMPTY_STREAK, "2026-01-10");
    s = nextStreak(s, "2026-01-11");
    s = nextStreak(s, "2026-01-12");
    expect(s.current).toBe(3);
    expect(s.longest).toBe(3);
  });

  it("crosses a month boundary correctly", () => {
    let s = nextStreak(EMPTY_STREAK, "2026-01-31");
    s = nextStreak(s, "2026-02-01");
    expect(s.current).toBe(2);
  });

  it("resets to 1 after a gap but keeps the longest", () => {
    let s = nextStreak(EMPTY_STREAK, "2026-01-10");
    s = nextStreak(s, "2026-01-11");
    s = nextStreak(s, "2026-01-12");
    s = nextStreak(s, "2026-01-20");
    expect(s.current).toBe(1);
    expect(s.longest).toBe(3);
  });
});
