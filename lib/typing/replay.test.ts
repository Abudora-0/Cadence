import { describe, expect, it } from "vitest";
import type { RunSample } from "./types";
import { buildReplay, caretIndexAt, samplesUpTo } from "./replay";

const sample = (t: number): RunSample => ({ t, wpm: 40, raw: 42, acc: 98, errors: 1 });

describe("buildReplay", () => {
  it("produces one char per target character plus a gap between words", () => {
    const model = buildReplay("ab cd", "ab cd", [0, 10, 20, 30, 40], 1);
    // a b <gap> c d
    expect(model.chars.map((c) => c.char)).toEqual(["a", "b", " ", "c", "d"]);
  });

  it("marks typed characters as correct or wrong and untyped as null", () => {
    const model = buildReplay("cat dog", "cxt", [0, 5, 10], 1);
    expect(model.chars.map((c) => c.typedOk)).toEqual([
      true, // c
      false, // x vs a
      true, // t
      null, // gap
      null, // d (not typed)
      null, // o
      null, // g
    ]);
  });

  it("totalMs is at least the run duration and the last tick", () => {
    expect(buildReplay("ab", "ab", [0, 900], 2).totalMs).toBe(2000);
    expect(buildReplay("ab", "ab", [0, 5000], 2).totalMs).toBe(5000);
  });

  it("handles empty text", () => {
    const model = buildReplay("", undefined, [], 0);
    expect(model.chars).toEqual([]);
  });
});

describe("caretIndexAt", () => {
  const model = buildReplay("abcd", "abcd", [100, 200, 300, 400], 1);

  it("is 0 at time 0 and before the first tick", () => {
    expect(caretIndexAt(model, 0)).toBe(0);
    expect(caretIndexAt(model, 99)).toBe(0);
  });

  it("advances one character per passed tick", () => {
    expect(caretIndexAt(model, 100)).toBe(1);
    expect(caretIndexAt(model, 250)).toBe(2);
    expect(caretIndexAt(model, 400)).toBe(4);
  });

  it("clamps at the end and never goes negative", () => {
    expect(caretIndexAt(model, 99999)).toBe(4);
    expect(caretIndexAt(model, -50)).toBe(0);
  });

  it("is monotonic", () => {
    let prev = -1;
    for (let t = 0; t <= 500; t += 17) {
      const c = caretIndexAt(model, t);
      expect(c).toBeGreaterThanOrEqual(prev);
      prev = c;
    }
  });
});

describe("samplesUpTo", () => {
  const samples = [sample(1), sample(2), sample(3), sample(4)];

  it("returns only samples at or before the given time", () => {
    expect(samplesUpTo(samples, 2500).map((s) => s.t)).toEqual([1, 2]);
    expect(samplesUpTo(samples, 0).length).toBe(0);
    expect(samplesUpTo(samples, 10000).length).toBe(4);
  });
});
