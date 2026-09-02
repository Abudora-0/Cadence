"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import clsx from "clsx";
import { emitPulse } from "@/lib/landing/pulse-bus";

const LINE = "hold a steady tempo";
const WORDS = LINE.split(" ");

export function MiniTypingStrip() {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [focused, setFocused] = useState(false);

  const go = () => {
    try {
      sessionStorage.setItem("cadence.landed", String(Date.now()));
    } catch {
      // ignore
    }
    router.push("/practice");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      go();
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      setTyped((t) => t.slice(0, -1));
      return;
    }
    if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    const next = typed + e.key;
    const ok = e.key === LINE[typed.length];
    emitPulse(ok);
    setTyped(next.slice(0, LINE.length));
    if (next.length >= LINE.length) {
      window.setTimeout(go, 260);
    }
  };

  return (
    <label className="group relative block w-full max-w-xl cursor-text rounded-[var(--radius-lg)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] px-5 py-4 text-left backdrop-blur transition-colors hover:border-[var(--border-strong)]">
      <span className="mono-label">Try a line</span>
      <p
        className="mt-2 flex flex-wrap gap-x-[0.45ch] text-lg leading-relaxed tracking-tight sm:text-xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {WORDS.map((word, wi) => {
          const start = WORDS.slice(0, wi).reduce(
            (a, w) => a + w.length + 1,
            0,
          );
          return (
            <span key={wi} className="whitespace-nowrap">
              {word.split("").map((ch, ci) => {
                const idx = start + ci;
                const state =
                  idx < typed.length
                    ? typed[idx] === ch
                      ? "correct"
                      : "incorrect"
                    : "pending";
                return (
                  <span
                    key={ci}
                    className={clsx(
                      "relative",
                      state === "correct" && "text-[var(--correct)]",
                      state === "incorrect" &&
                        "rounded-[2px] bg-[var(--incorrect-bg)] text-[var(--incorrect)]",
                      state === "pending" && "text-[var(--text-faint)]",
                    )}
                  >
                    {idx === typed.length && (
                      <motion.span
                        layoutId="mini-caret"
                        className={clsx(
                          "absolute -left-[1px] top-1/2 h-[1.1em] w-[2px] -translate-y-1/2 bg-[var(--caret)]",
                          !focused && "animate-pulse",
                        )}
                      />
                    )}
                    {ch}
                  </span>
                );
              })}
            </span>
          );
        })}
      </p>
      <span className="mt-2 block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--text-faint)]">
        {typed.length > 0
          ? "Enter to open the full test"
          : "Start typing, we will take you in"}
      </span>

      <input
        type="text"
        value=""
        onChange={() => {}}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Type the sample line"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        className="absolute inset-0 h-full w-full cursor-text bg-transparent text-[16px] text-transparent caret-transparent outline-none"
      />
    </label>
  );
}
