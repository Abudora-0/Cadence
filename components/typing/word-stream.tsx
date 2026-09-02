"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import clsx from "clsx";
import type { EngineSnapshot } from "@/lib/typing/use-typing-engine";
import { hasRtlText } from "@/lib/typing/languages";
import { useSettings } from "@/lib/store/settings-store";

interface WordStreamProps {
  snapshot: EngineSnapshot;
  focused: boolean;
  onFocusRequest: () => void;
}

const VISIBLE_LINES = 3;
const LTR_LINE_HEIGHT = 46;
const RTL_LINE_HEIGHT = 64;

export function WordStream({ snapshot, focused, onFocusRequest }: WordStreamProps) {
  const caretStyle = useSettings((s) => s.caret);
  const smooth = useSettings((s) => s.smoothCaret);

  const rtl = useMemo(
    () => hasRtlText(snapshot.targetWords.join(" ")),
    [snapshot.targetWords],
  );
  const lineHeight = rtl ? RTL_LINE_HEIGHT : LTR_LINE_HEIGHT;

  const wrapRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const [caret, setCaret] = useState({ x: 0, y: 0, h: 28, ready: false });
  const [scrollY, setScrollY] = useState(0);

  const activeKey = `${snapshot.wordIndex}:${snapshot.caretOffset}`;

  useLayoutEffect(() => {
    const flow = flowRef.current;
    if (!flow) return;

    const word = snapshot.wordCells[snapshot.wordIndex];
    const target: HTMLElement | null =
      charRefs.current.get(activeKey) ??
      charRefs.current.get(`${snapshot.wordIndex}:${(word?.chars.length ?? 1) - 1}`) ??
      null;

    let atEnd = false;
    if (!charRefs.current.get(activeKey) && word) {
      atEnd = snapshot.caretOffset >= word.chars.length;
    }

    if (!target) {
      setCaret((c) => ({ ...c, ready: false }));
      return;
    }

    const flowBox = flow.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    // The caret sits before the target character. In LTR that is the left edge,
    // in RTL the right edge. At the end of a word it flips to the far side.
    const x = rtl
      ? box.right - flowBox.left - (atEnd ? box.width : 0)
      : box.left - flowBox.left + (atEnd ? box.width : 0);
    const y = box.top - flowBox.top;
    setCaret({ x, y, h: box.height, ready: true });

    // Keep the active line pinned to the middle row.
    const line = Math.round(y / lineHeight);
    const desired = Math.max(0, (line - 1) * lineHeight);
    setScrollY(desired);
  }, [
    activeKey,
    snapshot.wordCells,
    snapshot.wordIndex,
    snapshot.caretOffset,
    rtl,
    lineHeight,
  ]);

  return (
    <div
      ref={wrapRef}
      onClick={onFocusRequest}
      dir={rtl ? "rtl" : "ltr"}
      className={clsx(
        "relative w-full cursor-text overflow-hidden",
        !focused && "focus-dim",
      )}
      style={{ height: lineHeight * VISIBLE_LINES }}
    >
      <motion.div
        ref={flowRef}
        className={clsx(
          "flex flex-wrap gap-x-[0.55ch] gap-y-1 tracking-tight",
          rtl ? "rtl-text text-[1.5rem]" : "text-[1.75rem]",
        )}
        style={{
          fontFamily: rtl ? "var(--font-urdu)" : "var(--font-display)",
          lineHeight: `${lineHeight}px`,
        }}
        animate={{ y: -scrollY }}
        transition={{ type: "spring", stiffness: 220, damping: 32 }}
      >
        {snapshot.wordCells.map((word, wi) => (
          <span
            key={wi}
            className={clsx(
              "relative whitespace-nowrap transition-opacity",
              word.done && !word.hadError && "opacity-45",
              word.hadError && "underline decoration-[var(--incorrect)] decoration-wavy underline-offset-8",
            )}
          >
            {word.chars.map((cell, ci) => (
              <span
                key={ci}
                ref={(el) => {
                  const key = `${wi}:${ci}`;
                  if (el) charRefs.current.set(key, el);
                  else charRefs.current.delete(key);
                }}
                className={clsx(
                  cell.state === "correct" && "char-correct",
                  cell.state === "incorrect" && "char-incorrect",
                  cell.state === "pending" && "char-pending",
                  cell.state === "extra" && "char-extra",
                )}
              >
                {cell.char}
              </span>
            ))}
          </span>
        ))}
      </motion.div>

      {caret.ready && caretStyle !== "off" && (
        <motion.span
          className={clsx(
            "pointer-events-none absolute left-0 top-0 bg-[var(--caret)] shadow-[0_0_12px_var(--glow)]",
            snapshot.status !== "running" && "caret-blink",
          )}
          style={{
            height: caretStyle === "underline" ? 3 : caret.h,
            width: caretStyle === "block" ? "1ch" : caretStyle === "underline" ? "1ch" : 2,
            borderRadius: 2,
            opacity: caretStyle === "block" ? 0.35 : 1,
          }}
          animate={{
            x: caret.x,
            y:
              (caretStyle === "underline" ? caret.y + caret.h - 2 : caret.y) -
              scrollY,
          }}
          transition={
            smooth
              ? { type: "spring", stiffness: 900, damping: 55 }
              : { duration: 0 }
          }
        />
      )}
    </div>
  );
}
