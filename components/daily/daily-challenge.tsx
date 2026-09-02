"use client";

import { useMemo, useState } from "react";
import { CadenceLogo } from "@/components/logo/cadence-logo";
import { TypingTest } from "@/components/typing/typing-test";
import { useProgress } from "@/lib/store/progress-store";
import {
  DAILY_CONFIG,
  dailyConfigKey,
  dailySeed,
  utcDayString,
} from "@/lib/typing/daily";
import type { RunResult } from "@/lib/typing/types";
import { DailyShareCard } from "./daily-share-card";

export function DailyChallenge() {
  const day = useMemo(() => utcDayString(), []);
  const seed = useMemo(() => dailySeed(day), [day]);
  const { progress } = useProgress();
  const [lastResult, setLastResult] = useState<RunResult | null>(null);

  const today = progress.daily[day];
  const prettyDate = new Date(`${day}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <CadenceLogo size={26} />
          <span className="mono-label">Daily challenge</span>
        </div>
        <h1
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {prettyDate}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--text-dim)]">
          Fifty words, punctuation on, the same text for everyone today. Restart as
          many times as you like. Everything stays on your device.
        </p>
        {today && (
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-faint)]">
            {today.attempts} {today.attempts === 1 ? "attempt" : "attempts"} today
            {" · "}best {Math.round(today.bestWpm)} wpm at{" "}
            {today.bestAcc.toFixed(0)}% accuracy
          </p>
        )}
      </header>

      <TypingTest
        lockedConfig={DAILY_CONFIG}
        seed={seed}
        dailyDate={day}
        configKeyOverride={dailyConfigKey(day)}
        onFinish={setLastResult}
      />

      {lastResult && <DailyShareCard result={lastResult} day={day} />}
    </div>
  );
}
