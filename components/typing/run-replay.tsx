"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import clsx from "clsx";
import type { RunResult } from "@/lib/typing/types";
import {
  buildReplay,
  caretIndexAt,
  samplesUpTo,
} from "@/lib/typing/replay";
import { Segmented } from "@/components/ui/segmented";
import { SpeedGraph } from "./speed-graph";
import { ResultsCard } from "./results-card";

const SPEEDS = [0.5, 1, 2, 4] as const;
type Speed = (typeof SPEEDS)[number];

export function RunReplay({ run }: { run: RunResult }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const model = useMemo(
    () => buildReplay(run.text ?? "", run.typed, run.timeline, run.durationSec),
    [run],
  );

  const [tMs, setTMs] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<Speed>(1);
  const [done, setDone] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    lastRef.current = performance.now();
    const tick = (now: number) => {
      const dt = now - lastRef.current;
      lastRef.current = now;
      setTMs((prev) => {
        const next = prev + dt * speed;
        if (next >= model.totalMs) {
          setPlaying(false);
          setDone(true);
          return model.totalMs;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, speed, model.totalMs]);

  const caret = caretIndexAt(model, tMs);
  const elapsedSec = Math.min(tMs, model.totalMs) / 1000;
  const totalSec = model.totalMs / 1000;

  const restart = () => {
    setTMs(0);
    setDone(false);
    setPlaying(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="mono-label">Replay</span>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {run.configLabel}
          </h1>
        </div>
        <Link
          href="/stats"
          className="rounded-[var(--radius)] border border-[var(--border-strong)] px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
        >
          Back to stats
        </Link>
      </div>

      <div className="panel px-5 py-7 sm:px-8 sm:py-9">
        <p
          className="flex flex-wrap gap-x-[0.5ch] gap-y-1 text-[1.6rem] leading-[42px] tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {model.chars.map((c, i) => {
            const passed = i < caret;
            return (
              <span key={i} className="relative whitespace-pre">
                {i === caret && (
                  <motion.span
                    className="pointer-events-none absolute -left-[1px] top-1/2 h-[1.1em] w-[2px] -translate-y-1/2 bg-[var(--caret)] shadow-[0_0_12px_var(--glow)]"
                    layout={!reduce}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 900, damping: 55 }
                    }
                  />
                )}
                <span
                  className={clsx(
                    c.char === " " && "px-[0.15ch]",
                    !passed && "text-[var(--pending)]",
                    passed && c.typedOk === true && "text-[var(--correct)]",
                    passed &&
                      c.typedOk === false &&
                      "rounded-[2px] bg-[var(--incorrect-bg)] text-[var(--incorrect)]",
                    passed && c.typedOk === null && "text-[var(--text-dim)]",
                  )}
                >
                  {c.char === " " ? " " : c.char}
                </span>
              </span>
            );
          })}
        </p>

        <div className="mt-6 border-t border-[var(--border)] pt-4">
          <SpeedGraph
            samples={samplesUpTo(run.samples, tMs)}
            compareWpm={run.wpm}
            live
            height={130}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            if (done) restart();
            else setPlaying((p) => !p);
          }}
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--primary)] text-[var(--primary)] transition-colors hover:bg-[var(--primary-dim)]"
          aria-label={done ? "Replay again" : playing ? "Pause" : "Play"}
        >
          {done ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M2 7a5 5 0 1 0 1.5-3.5M2 2v3h3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : playing ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
              <rect x="1" y="1" width="3.5" height="10" rx="1" />
              <rect x="7.5" y="1" width="3.5" height="10" rx="1" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
              <path d="M2 1l9 5-9 5z" />
            </svg>
          )}
        </motion.button>

        <input
          type="range"
          min={0}
          max={model.totalMs}
          step={20}
          value={Math.min(tMs, model.totalMs)}
          onChange={(e) => {
            setTMs(Number(e.target.value));
            setDone(false);
          }}
          aria-label="Scrub the replay"
          className="h-1 flex-1 min-w-[8rem] cursor-pointer appearance-none rounded-full bg-[var(--surface-2)] accent-[var(--primary)]"
        />

        <span className="font-mono text-[0.7rem] tabular-nums text-[var(--text-faint)]">
          {elapsedSec.toFixed(1)}s / {totalSec.toFixed(1)}s
        </span>

        <Segmented<Speed>
          size="sm"
          ariaLabel="Playback speed"
          options={SPEEDS.map((s) => ({ value: s, label: `${s}x` }))}
          value={speed}
          onChange={setSpeed}
        />
      </div>

      {done && (
        <ResultsCard
          result={run}
          previousBest={null}
          onNext={restart}
          onRepeat={() => router.push("/stats")}
          nextLabel="Watch again"
          repeatLabel="Back to stats"
          hint=""
        />
      )}
    </div>
  );
}
