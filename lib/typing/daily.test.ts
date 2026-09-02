import { describe, expect, it } from "vitest";
import {
  DAILY_CONFIG,
  dailyConfigKey,
  dailySeed,
  dailyTargetWords,
  utcDayString,
} from "./daily";

describe("DAILY_CONFIG", () => {
  it("is a fixed 50 word run", () => {
    expect(DAILY_CONFIG).toMatchObject({
      mode: "words",
      wordCount: 50,
      language: "english-1k",
      punctuation: true,
      numbers: false,
    });
  });
});

describe("dailySeed", () => {
  it("is deterministic for a date", () => {
    expect(dailySeed("2026-03-14")).toBe(dailySeed("2026-03-14"));
  });

  it("differs across dates", () => {
    expect(dailySeed("2026-03-14")).not.toBe(dailySeed("2026-03-15"));
  });
});

describe("dailyTargetWords", () => {
  it("is the same list on repeated calls", () => {
    expect(dailyTargetWords("2026-03-14")).toEqual(dailyTargetWords("2026-03-14"));
  });

  it("has 50 words", () => {
    expect(dailyTargetWords("2026-03-14").length).toBe(50);
  });

  it("differs between two dates", () => {
    expect(dailyTargetWords("2026-03-14")).not.toEqual(
      dailyTargetWords("2026-03-15"),
    );
  });
});

describe("dailyConfigKey", () => {
  it("is namespaced by the date", () => {
    expect(dailyConfigKey("2026-03-14")).toBe("daily:2026-03-14");
  });
});

describe("utcDayString via daily", () => {
  it("rolls over at UTC midnight, not local", () => {
    expect(utcDayString(Date.parse("2026-03-14T23:59:59Z"))).toBe("2026-03-14");
    expect(utcDayString(Date.parse("2026-03-15T00:00:01Z"))).toBe("2026-03-15");
  });
});
