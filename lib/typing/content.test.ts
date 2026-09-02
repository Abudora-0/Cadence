import { describe, expect, it } from "vitest";
import {
  DEFAULT_MODE_CONFIG,
  configKeyOf,
  configLabelOf,
  type ModeConfig,
} from "./types";
import { QUOTES, pickQuote } from "./quotes";
import { CODE_SNIPPETS, pickCodeSnippet } from "./code-snippets";

const cfg = (over: Partial<ModeConfig> = {}): ModeConfig => ({
  ...DEFAULT_MODE_CONFIG,
  ...over,
});

describe("configKeyOf", () => {
  it("captures the settings that change the text for time mode", () => {
    expect(configKeyOf(cfg({ mode: "time", timeSec: 30 }))).toBe(
      "time:30:english:p0:n0",
    );
    expect(
      configKeyOf(cfg({ mode: "time", timeSec: 30, punctuation: true, numbers: true })),
    ).toBe("time:30:english:p1:n1");
  });

  it("keys words mode on the word count", () => {
    expect(configKeyOf(cfg({ mode: "words", wordCount: 25 }))).toContain("words:25");
  });

  it("keys code mode on the language", () => {
    expect(configKeyOf(cfg({ mode: "code", codeLang: "python" }))).toBe("code:python");
  });

  it("differs between two configs that render different text", () => {
    expect(configKeyOf(cfg({ mode: "time", timeSec: 15 }))).not.toBe(
      configKeyOf(cfg({ mode: "time", timeSec: 60 })),
    );
  });

  it("keys custom mode on a hash of the passage", () => {
    const a = configKeyOf(cfg({ mode: "custom" }), "hold a steady tempo");
    const b = configKeyOf(cfg({ mode: "custom" }), "hold a steady tempo");
    const c = configKeyOf(cfg({ mode: "custom" }), "a different passage here");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a.startsWith("custom:")).toBe(true);
    expect(configKeyOf(cfg({ mode: "custom" }))).toBe("custom:0");
  });
});

describe("configLabelOf", () => {
  it("is human readable per mode", () => {
    expect(configLabelOf(cfg({ mode: "time", timeSec: 60 }))).toBe("time 60s");
    expect(configLabelOf(cfg({ mode: "words", wordCount: 10 }))).toBe("words 10");
    expect(configLabelOf(cfg({ mode: "quote" }))).toBe("quote");
    expect(configLabelOf(cfg({ mode: "code", codeLang: "javascript" }))).toBe(
      "code javascript",
    );
    expect(configLabelOf(cfg({ mode: "zen" }))).toBe("zen");
  });
});

describe("pickQuote", () => {
  it("is deterministic for a seed", () => {
    expect(pickQuote(undefined, 4)).toBe(pickQuote(undefined, 4));
  });

  it("stays inside the pool for any seed", () => {
    for (let seed = 0; seed < 50; seed += 1) {
      expect(QUOTES).toContain(pickQuote(undefined, seed));
    }
  });

  it("respects a length preference", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      expect(pickQuote("short", seed).length).toBe("short");
    }
  });
});

describe("pickCodeSnippet", () => {
  it("is deterministic for a seed", () => {
    expect(pickCodeSnippet("python", 2)).toBe(pickCodeSnippet("python", 2));
  });

  it("only returns snippets in the requested language", () => {
    for (let seed = 0; seed < 30; seed += 1) {
      expect(pickCodeSnippet("javascript", seed).lang).toBe("javascript");
      expect(pickCodeSnippet("python", seed).lang).toBe("python");
    }
  });

  it("has a healthy pool per supported language", () => {
    expect(CODE_SNIPPETS.filter((s) => s.lang === "javascript").length).toBeGreaterThanOrEqual(6);
    expect(CODE_SNIPPETS.filter((s) => s.lang === "python").length).toBeGreaterThanOrEqual(6);
  });
});

describe("QUOTES", () => {
  it("has a healthy pool with every length represented", () => {
    expect(QUOTES.length).toBeGreaterThanOrEqual(20);
    expect(QUOTES.some((q) => q.length === "short")).toBe(true);
    expect(QUOTES.some((q) => q.length === "medium")).toBe(true);
    expect(QUOTES.some((q) => q.length === "long")).toBe(true);
  });

  it("contains no em dashes", () => {
    for (const q of QUOTES) {
      expect(q.text.includes("—")).toBe(false);
    }
  });
});
