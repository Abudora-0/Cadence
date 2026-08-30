"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSettings } from "@/lib/store/settings-store";
import { useTypingEngine } from "@/lib/typing/use-typing-engine";
import {
  addRun,
  bestForConfig,
  useHistory,
} from "@/lib/store/history-store";
import {
  playFanfare,
  playKey,
  unlockAudio,
} from "@/lib/audio/sound-engine";
import type { RunSample } from "@/lib/typing/types";
import { ModeBar } from "./mode-bar";
import { SpeedGraph } from "./speed-graph";
import { RunHud } from "./run-hud";
import { WordStream } from "./word-stream";
import { KeystrokeWaveform } from "./keystroke-waveform";
import { MetronomePulse } from "./metronome-pulse";
import { GhostRace } from "./ghost-race";
import { ResultsCard } from "./results-card";

export function TypingTest() {
  const config = useSettings((s) => s.config);
  const voice = useSettings((s) => s.voice);
  const soundOnError = useSettings((s) => s.soundOnError);
  const focusMode = useSettings((s) => s.focusMode);
  const showGraph = useSettings((s) => s.liveGraph);
  const showGhost = useSettings((s) => s.ghost);
  const hydrated = useSettings((s) => s.hydrated);

  const { snapshot, handleKey, restart, finishZen } = useTypingEngine(config);
  const { runs } = useHistory();

  const [focused, setFocused] = useState(true);
  const idleTimer = useRef<number | null>(null);
  const lastEventId = useRef<number>(-1);
  const savedResultId = useRef<string | null>(null);

  const best = bestForConfig(runs, snapshot.configKey);

  const nudgeFocus = useCallback(() => {
    setFocused(true);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setFocused(false), 2600);
  }, []);

  // Global key handling: routing, restart, escape.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      unlockAudio();

      if (e.key === "Tab") {
        e.preventDefault();
        restart();
        nudgeFocus();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        restart();
        return;
      }
      if (
        e.key === "Enter" &&
        config.mode === "zen" &&
        snapshot.status === "running"
      ) {
        e.preventDefault();
        finishZen();
        return;
      }

      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.getAttribute("role") === "listbox" ||
          target.closest('[role="listbox"],[role="dialog"]'))
      ) {
        return;
      }

      handleKey(e);
      if (
        e.key.length === 1 ||
        e.key === " " ||
        e.code === "Space" ||
        e.key === "Backspace"
      ) {
        nudgeFocus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey, restart, finishZen, nudgeFocus, config.mode, snapshot.status]);

  // Keystroke sounds.
  useEffect(() => {
    const ev = snapshot.lastEvent;
    if (!ev || ev.id === lastEventId.current) return;
    lastEventId.current = ev.id;
    if (ev.kind === "back") return;
    if (!ev.correct && soundOnError) {
      playKey(voice, { error: true });
    } else {
      playKey(voice);
    }
  }, [snapshot.lastEvent, voice, soundOnError]);

  // Persist finished runs once.
  useEffect(() => {
    const result = snapshot.result;
    if (!result || savedResultId.current === result.id) return;
    savedResultId.current = result.id;
    void addRun(result);
    playFanfare();
  }, [snapshot.result]);

  const running = snapshot.status === "running";
  const finished = snapshot.status === "finished";

  return (
    <div className="flex w-full flex-col gap-8">
      <motion.div
        animate={{ opacity: running && focusMode ? 0.15 : 1, y: running && focusMode ? -4 : 0 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-auto"
      >
        <ModeBar onAnyChange={restart} />
      </motion.div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <RunHud snapshot={snapshot} bestWpm={best?.wpm ?? null} />
          <MetronomePulse intervalMs={snapshot.keyIntervalMs} running={running} />
        </div>

        <div className="panel px-5 py-7 sm:px-8 sm:py-9">
          <WordStream
            snapshot={snapshot}
            focused={focused || !running}
            onFocusRequest={nudgeFocus}
          />
          <div className="mt-6 border-t border-[var(--border)] pt-4">
            <KeystrokeWaveform lastEvent={snapshot.lastEvent} running={running} />
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {showGhost ? (
            <div className="min-w-0 flex-1">
              <GhostRace
                ghost={best}
                elapsedMs={snapshot.elapsedMs}
                progress={snapshot.progress}
                running={running}
              />
            </div>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => {
              restart();
              nudgeFocus();
            }}
            className="self-start rounded-[var(--radius)] border border-[var(--border-strong)] px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--text-dim)] transition-colors hover:border-[var(--primary)] hover:text-[var(--text)]"
          >
            {config.mode === "zen" && running ? "finish  (enter)" : "restart  (tab)"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {finished && snapshot.result && (
          <motion.div
            key={snapshot.result.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <ResultsCard
              result={snapshot.result}
              previousBest={
                best && best.id !== snapshot.result.id ? best.wpm : null
              }
              onNext={() => {
                restart();
                nudgeFocus();
              }}
              onRepeat={() => {
                restart();
                nudgeFocus();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showGraph && running && snapshot.samples.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: focusMode ? 0.25 : 1 }}
          className="panel p-4"
        >
          <span className="mono-label">Live tempo</span>
          <div className="mt-2">
            <LiveGraphLazy samples={snapshot.samples} />
          </div>
        </motion.div>
      )}

      {!hydrated && (
        <p className="text-center font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-faint)]">
          loading your settings
        </p>
      )}
    </div>
  );
}

function LiveGraphLazy({ samples }: { samples: RunSample[] }) {
  return <SpeedGraph samples={samples} live height={120} showRaw={false} />;
}
