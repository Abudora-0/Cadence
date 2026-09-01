import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { DEFAULT_MODE_CONFIG, type ModeConfig } from "./types";
import { useTypingEngine } from "./use-typing-engine";

const cfg = (over: Partial<ModeConfig> = {}): ModeConfig => ({
  ...DEFAULT_MODE_CONFIG,
  ...over,
});

/** A string of the same length as `w` that matches it nowhere. */
const flip = (w: string) => [...w].map((c) => (c === "x" ? "y" : "x")).join("");

function setup(over: Partial<ModeConfig> = {}) {
  const view = renderHook((props: ModeConfig) => useTypingEngine(props), {
    initialProps: cfg(over),
  });
  const type = (text: string) => act(() => view.result.current.pressText(text));
  const back = (whole = false) =>
    act(() => view.result.current.pressBackspace(whole));
  return { ...view, type, back, snap: () => view.result.current.snapshot };
}

describe("useTypingEngine", () => {
  it("starts idle and begins running on the first keystroke", () => {
    const { snap, type } = setup({ mode: "words", wordCount: 10 });
    expect(snap().status).toBe("idle");
    type(snap().targetWords[0][0]);
    expect(snap().status).toBe("running");
  });

  it("marks matching and mismatching characters", () => {
    const { snap, type } = setup({ mode: "words", wordCount: 10 });
    const target = snap().targetWords[0];
    type(target[0]);
    expect(snap().wordCells[0].chars[0].state).toBe("correct");

    const { snap: snap2, type: type2 } = setup({ mode: "words", wordCount: 10 });
    const t2 = snap2().targetWords[0];
    type2(t2[0] === "z" ? "x" : "z");
    expect(snap2().wordCells[0].chars[0].state).toBe("incorrect");
  });

  it("commits a word and advances on space", () => {
    const { snap, type } = setup({ mode: "words", wordCount: 10 });
    const w0 = snap().targetWords[0];
    type(`${w0} `);
    expect(snap().wordIndex).toBe(1);
    expect(snap().wordCells[0].done).toBe(true);
    expect(snap().wordCells[0].hadError).toBe(false);
  });

  it("ignores a space typed at the start of a word", () => {
    const { snap, type } = setup({ mode: "words", wordCount: 10 });
    type(" ");
    expect(snap().wordIndex).toBe(0);
    expect(snap().status).toBe("idle");
  });

  it("removes the last character on backspace", () => {
    const { snap, type, back } = setup({ mode: "words", wordCount: 10 });
    const w0 = snap().targetWords[0];
    type(w0.slice(0, 3));
    expect(snap().caretOffset).toBe(3);
    back();
    expect(snap().caretOffset).toBe(2);
  });

  it("clears the current word on ctrl+backspace", () => {
    const { snap, type, back } = setup({ mode: "words", wordCount: 10 });
    type(snap().targetWords[0].slice(0, 4));
    back(true);
    expect(snap().caretOffset).toBe(0);
  });

  it("does not backspace into a word that was typed correctly", () => {
    const { snap, type, back } = setup({ mode: "words", wordCount: 10 });
    type(`${snap().targetWords[0]} `);
    expect(snap().wordIndex).toBe(1);
    back();
    expect(snap().wordIndex).toBe(1);
  });

  it("backspaces into a previous word that had an error", () => {
    const { snap, type, back } = setup({ mode: "words", wordCount: 10 });
    const w0 = snap().targetWords[0];
    type(`${flip(w0)} `);
    expect(snap().wordIndex).toBe(1);
    back();
    expect(snap().wordIndex).toBe(0);
  });

  it("finishes a words run and reports a clean result", () => {
    const { snap, type } = setup({ mode: "words", wordCount: 3 });
    const [w0, w1, w2] = snap().targetWords;
    type(`${w0} `);
    type(`${w1} `);
    type(w2);

    expect(snap().status).toBe("finished");
    const result = snap().result;
    expect(result).not.toBeNull();
    expect(result?.accuracy).toBe(100);
    expect(result?.consistency).toBe(100);
    expect(result?.chars.incorrect).toBe(0);
    expect(result?.chars.correct).toBe(
      w0.length + w1.length + w2.length + 2, // two committed spaces
    );
    expect(result?.wpm).toBeGreaterThan(0);
    expect(result?.timeline.length).toBeGreaterThan(0);
  });

  it("counts mistakes in the result", () => {
    const { snap, type } = setup({ mode: "words", wordCount: 2 });
    const [w0, w1] = snap().targetWords;
    type(`${flip(w0)} `);
    type(w1);
    const result = snap().result;
    expect(result?.chars.incorrect).toBe(w0.length);
    expect(result?.accuracy).toBeLessThan(100);
  });

  it("does not finish on the last word in time mode", () => {
    const { snap, type } = setup({ mode: "time", timeSec: 15 });
    const words = snap().targetWords;
    type(`${words[0]} ${words[1]} `);
    expect(snap().status).toBe("running");
    expect(snap().remainingSec).not.toBeNull();
  });

  it("keeps extending the word list in zen mode and only ends on finish", () => {
    const { result, snap, type } = setup({ mode: "zen" });
    const startLength = snap().targetWords.length;

    // Type past the point where the buffer tops itself up.
    for (let i = 0; i < startLength - 6; i += 1) {
      type(`${snap().targetWords[i]} `);
    }
    expect(snap().status).toBe("running");
    expect(snap().targetWords.length).toBeGreaterThan(startLength);

    act(() => result.current.finishZen());
    expect(snap().status).toBe("finished");
    expect(snap().result).not.toBeNull();
  });

  it("tracks progress from zero upward", () => {
    const { snap, type } = setup({ mode: "words", wordCount: 10 });
    expect(snap().progress).toBe(0);
    type(`${snap().targetWords[0]} `);
    expect(snap().progress).toBeGreaterThan(0);
    expect(snap().progress).toBeLessThan(1);
  });

  it("restart clears the run and reshuffles the text", () => {
    const { result, snap, type } = setup({ mode: "words", wordCount: 10 });
    type(`${snap().targetWords[0]} abc`);
    expect(snap().status).toBe("running");
    act(() => result.current.restart());
    expect(snap().status).toBe("idle");
    expect(snap().wordIndex).toBe(0);
    expect(snap().caretOffset).toBe(0);
  });

  it("resets when the run configuration changes", () => {
    const { result, rerender, snap, type } = setup({ mode: "words", wordCount: 10 });
    type("abc");
    expect(snap().status).toBe("running");
    rerender(cfg({ mode: "words", wordCount: 25 }));
    expect(result.current.snapshot.status).toBe("idle");
    expect(result.current.snapshot.wordIndex).toBe(0);
  });

  it("routes real keydown events, including the spacebar", () => {
    const { result, snap } = setup({ mode: "words", wordCount: 5 });
    const w0 = snap().targetWords[0];
    act(() => {
      for (const ch of w0) {
        result.current.handleKey(new KeyboardEvent("keydown", { key: ch }));
      }
      result.current.handleKey(new KeyboardEvent("keydown", { key: " " }));
    });
    expect(result.current.snapshot.wordIndex).toBe(1);
    expect(result.current.snapshot.wordCells[0].hadError).toBe(false);
  });

  it("recognises the spacebar by code when key is unavailable", () => {
    const { result, snap } = setup({ mode: "words", wordCount: 5 });
    const w0 = snap().targetWords[0];
    act(() => {
      for (const ch of w0) {
        result.current.handleKey(new KeyboardEvent("keydown", { key: ch }));
      }
      result.current.handleKey(new KeyboardEvent("keydown", { key: "", code: "Space" }));
    });
    expect(result.current.snapshot.wordIndex).toBe(1);
  });
});
