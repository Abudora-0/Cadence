"use client";

import { useMemo } from "react";
import { summarize, useHistory } from "@/lib/store/history-store";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Reveal } from "@/components/ui/reveal";

export function SocialProof() {
  const { runs, ready } = useHistory();
  const summary = useMemo(() => summarize(runs), [runs]);
  const hasHistory = ready && runs.length > 0;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
      <Reveal className="panel-raised flex flex-col gap-8 p-8 sm:p-12">
        {hasHistory ? (
          <>
            <span className="mono-label">Your record so far</span>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Stat label="Runs" value={summary.totalRuns} />
              <Stat label="Best WPM" value={summary.bestWpm} />
              <Stat label="Avg WPM" value={summary.avgWpm} decimals={1} />
              <Stat
                label="Avg accuracy"
                value={summary.avgAccuracy}
                decimals={1}
                suffix="%"
              />
            </div>
            <p className="text-sm text-[var(--text-dim)]">
              All of it recorded on this device. Nothing left your browser.
            </p>
          </>
        ) : (
          <>
            <span className="mono-label">How it works</span>
            <h2
              className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              No sign up. No tracking of what you type. Your history is yours.
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <Point
                k="01"
                t="Type"
                d="Pick a mode and go. Time, words, quote, code, zen, or your own text."
              />
              <Point
                k="02"
                t="See the rhythm"
                d="The waveform, the metronome and the speed graph all update as you type."
              />
              <Point
                k="03"
                t="Come back"
                d="Runs, personal bests, streaks and replays are stored locally for next time."
              />
            </div>
          </>
        )}
      </Reveal>
    </section>
  );
}

function Stat({
  label,
  value,
  decimals = 0,
  suffix,
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="mono-label">{label}</span>
      <span
        className="text-3xl font-semibold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
      </span>
    </div>
  );
}

function Point({ k, t, d }: { k: string; t: string; d: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[0.62rem] tracking-[0.2em] text-[var(--primary)]">
        {k}
      </span>
      <h3 className="text-base font-semibold text-[var(--text)]">{t}</h3>
      <p className="text-sm leading-relaxed text-[var(--text-dim)]">{d}</p>
    </div>
  );
}
