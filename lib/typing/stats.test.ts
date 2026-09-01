import { describe, expect, it } from "vitest";
import type { RunSample } from "./types";
import {
  accuracyFrom,
  bpmFromInterval,
  consistencyFrom,
  medianInterval,
  round,
  wpmFrom,
} from "./stats";

const sample = (wpm: number): RunSample => ({
  t: 1,
  wpm,
  raw: wpm,
  acc: 100,
  errors: 0,
});

describe("wpmFrom", () => {
  it("is (chars / 5) per minute", () => {
    // 250 correct chars in 60s = 50 words in 1 min = 50 wpm
    expect(wpmFrom(250, 60_000)).toBe(50);
  });

  it("scales with elapsed time", () => {
    expect(wpmFrom(250, 30_000)).toBe(100);
  });

  it("returns 0 for a non-positive duration", () => {
    expect(wpmFrom(100, 0)).toBe(0);
    expect(wpmFrom(100, -5)).toBe(0);
  });

  it("returns 0 when nothing was typed", () => {
    expect(wpmFrom(0, 10_000)).toBe(0);
  });
});

describe("accuracyFrom", () => {
  it("is a percentage of correct over total", () => {
    expect(accuracyFrom(9, 10)).toBe(90);
    expect(accuracyFrom(10, 10)).toBe(100);
  });

  it("treats an empty run as 100 percent", () => {
    expect(accuracyFrom(0, 0)).toBe(100);
  });
});

describe("consistencyFrom", () => {
  it("returns 100 for fewer than two usable samples", () => {
    expect(consistencyFrom([])).toBe(100);
    expect(consistencyFrom([sample(60)])).toBe(100);
  });

  it("returns 100 for a perfectly flat run", () => {
    expect(consistencyFrom([sample(60), sample(60), sample(60)])).toBe(100);
  });

  it("drops as the run gets swingier", () => {
    const steady = consistencyFrom([sample(58), sample(60), sample(62)]);
    const wild = consistencyFrom([sample(20), sample(90), sample(40), sample(120)]);
    expect(steady).toBeGreaterThan(wild);
    expect(wild).toBeGreaterThanOrEqual(0);
    expect(steady).toBeLessThanOrEqual(100);
  });

  it("ignores zero-wpm samples", () => {
    expect(consistencyFrom([sample(0), sample(60), sample(60)])).toBe(100);
  });
});

describe("round", () => {
  it("rounds to whole numbers by default", () => {
    expect(round(12.4)).toBe(12);
    expect(round(12.5)).toBe(13);
  });

  it("respects a digit count", () => {
    expect(round(12.345, 2)).toBe(12.35);
    expect(round(12.344, 2)).toBe(12.34);
  });
});

describe("medianInterval", () => {
  it("returns 0 with fewer than three timestamps", () => {
    expect(medianInterval([])).toBe(0);
    expect(medianInterval([0, 100])).toBe(0);
  });

  it("takes the median gap for an odd count", () => {
    // gaps: 100, 200, 300 -> median 200
    expect(medianInterval([0, 100, 300, 600])).toBe(200);
  });

  it("averages the two middle gaps for an even count", () => {
    // gaps: 100, 150, 200, 400 -> (150 + 200) / 2 = 175
    expect(medianInterval([0, 100, 250, 450, 850])).toBe(175);
  });

  it("discards gaps of two seconds or more (idle pauses)", () => {
    // gaps: 100, 5000, 120 -> only 100 and 120 remain -> median 110
    expect(medianInterval([0, 100, 5100, 5220])).toBe(110);
  });

  it("discards non-positive gaps", () => {
    expect(medianInterval([500, 100, 200, 300])).toBe(100);
  });
});

describe("bpmFromInterval", () => {
  it("converts a keystroke gap to beats per minute", () => {
    expect(bpmFromInterval(500)).toBe(120);
    expect(bpmFromInterval(1000)).toBe(60);
  });

  it("returns 0 for a non-positive interval", () => {
    expect(bpmFromInterval(0)).toBe(0);
  });
});
