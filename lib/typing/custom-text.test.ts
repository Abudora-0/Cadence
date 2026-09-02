import { describe, expect, it } from "vitest";
import {
  CUSTOM_TEXT_MAX_CHARS,
  customTokenCount,
  isUsableCustomText,
  tokenizeCustomText,
} from "./custom-text";

describe("tokenizeCustomText", () => {
  it("splits on whitespace", () => {
    expect(tokenizeCustomText("the quiet metronome")).toEqual([
      "the",
      "quiet",
      "metronome",
    ]);
  });

  it("turns newlines into a return token, like code mode", () => {
    expect(tokenizeCustomText("one\ntwo")).toEqual(["one", "↵", "two"]);
    expect(tokenizeCustomText("a\r\nb")).toEqual(["a", "↵", "b"]);
  });

  it("collapses runs of whitespace and trims", () => {
    expect(tokenizeCustomText("  a   b\t\tc  ")).toEqual(["a", "b", "c"]);
  });

  it("caps the token count", () => {
    const many = Array.from({ length: 900 }, (_, i) => `w${i}`).join(" ");
    expect(tokenizeCustomText(many).length).toBe(600);
  });

  it("returns an empty list for blank input", () => {
    expect(tokenizeCustomText("   \n  ")).toEqual([]);
  });
});

describe("isUsableCustomText", () => {
  it("accepts a normal passage", () => {
    expect(isUsableCustomText("type to a steady tempo and relax")).toBe(true);
  });

  it("rejects blank or whitespace only text", () => {
    expect(isUsableCustomText("")).toBe(false);
    expect(isUsableCustomText("   \n\t ")).toBe(false);
  });

  it("accepts a single word", () => {
    expect(isUsableCustomText("cadence")).toBe(true);
  });
});

describe("customTokenCount", () => {
  it("matches the tokenizer output length", () => {
    expect(customTokenCount("one two three")).toBe(3);
  });
});

describe("CUSTOM_TEXT_MAX_CHARS", () => {
  it("is a sane cap", () => {
    expect(CUSTOM_TEXT_MAX_CHARS).toBe(8000);
  });
});
