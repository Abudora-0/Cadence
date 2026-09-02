"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSettings } from "@/lib/store/settings-store";
import { useTypingEngine } from "@/lib/typing/use-typing-engine";
import { addRun, bestForConfig, useHistory } from "@/lib/store/history-store";
import { recordRun, useProgress } from "@/lib/store/progress-store";
import { pushToast } from "@/lib/store/toast-store";
import { useTheme } from "@/lib/store/theme-store";
import { playFanfare, playKey, unlockAudio } from "@/lib/audio/sound-engine";
import { achievementById } from "@/lib/typing/achievements";
import { isUsableCustomText } from "@/lib/typing/custom-text";
import type { ModeConfig, RunResult, RunSample } from "@/lib/typing/types";
import { ModeBar } from "./mode-bar";
import { SpeedGraph } from "./speed-graph";
import { RunHud } from "./run-hud";
import { WordStream } from "./word-stream";
import { KeystrokeWaveform } from "./keystroke-waveform";
import { MetronomePulse } from "./metronome-pulse";
import { GhostRace } from "./ghost-race";
import { ResultsCard } from "./results-card";

const TYPING_KEYS = new Set(["Backspace"]);
function isTypingKey(key: string, code: string): boolean {
  return key.length === 1 || key === " " || code === "Space" || TYPING_KEYS.has(key);
}

interface TypingTestProps {
  /** Fixed config for the daily challenge; hides the mode bar. */
  lockedConfig?: ModeConfig;
  /** Seed lock so the text is the same across mounts and restarts. */
  seed?: number;
  /** When set, finished runs are tagged as the daily challenge for that date. */
  dailyDate?: string;
  /** Overrides the stored configKey (used so daily bests are per date). */
  configKeyOverride?: string;
  /** Called once when a run is saved. */
  onFinish?: (result: RunResult) => void;
}

export function TypingTest({
  lockedConfig,
  seed,
  dailyDate,
  configKeyOverride,
  onFinish,
}: TypingTestProps = {}) {
  const storedConfig = useSettings((s) => s.config);
  const storedCustomText = useSettings((s) => s.customText);
  const config = lockedConfig ?? storedConfig;
  const customText = lockedConfig ? "" : storedCustomText;
  const voice = useSettings((s) => s.voice);
  const soundOnError = useSettings((s) => s.soundOnError);
  const focusMode = useSettings((s) => s.focusMode);
  const showGraph = useSettings((s) => s.liveGraph);
  const showGhost = useSettings((s) => s.ghost);
  const hydrated = useSettings((s) => s.hydrated);

  const { snapshot, handleKey, pressText, pressBackspace, restart, finishZen } =
    useTypingEngine(config, customText, seed != null ? { seed } : undefined);
  const needsCustomText =
    config.mode === "custom" && !isUsableCustomText(customText);
  const { runs } = useHistory();

  const theme = useTheme();
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);
  const { progress } = useProgress();

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const lastKeyHandledAt = useRef(0);
  const lastEventId = useRef<number>(-1);
  const savedResultId = useRef<string | null>(null);

  const effectiveKey = configKeyOverride ?? snapshot.configKey;
  const best = bestForConfig(runs, effectiveKey);

  const focusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const restartRun = useCallback(() => {
    restart();
    focusInput();
  }, [restart, focusInput]);

  // Put the cursor in the hidden field on first load so a physical keyboard
  // works without a click.
  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // Global shortcuts. Character input is handled on the hidden field, with this
  // as a fallback for physical keyboards when the field is not focused.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        restartRun();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        restartRun();
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
          target.closest('[role="listbox"],[role="dialog"]'))
      ) {
        return;
      }

      unlockAudio();
      handleKey(e);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey, restartRun, finishZen, config.mode, snapshot.status]);

  // Soft keyboard path: read composed text from the field, keep it empty.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const onBeforeInput = (event: Event) => {
      const e = event as InputEvent;
      if (e.cancelable) e.preventDefault();
      if (Date.now() - lastKeyHandledAt.current < 60) return;
      unlockAudio();
      const type = e.inputType;
      if (
        type === "insertText" ||
        type === "insertCompositionText" ||
        type === "insertFromPaste"
      ) {
        if (e.data) pressText(e.data);
      } else if (type === "insertLineBreak" || type === "insertParagraph") {
        if (config.mode === "zen" && snapshot.status === "running") finishZen();
        else pressText(" ");
      } else if (
        type === "deleteContentBackward" ||
        type === "deleteWordBackward" ||
        type === "deleteByCut"
      ) {
        pressBackspace(type === "deleteWordBackward");
      }
    };
    const keepEmpty = () => {
      el.value = "";
    };

    el.addEventListener("beforeinput", onBeforeInput);
    el.addEventListener("input", keepEmpty);
    el.addEventListener("compositionend", keepEmpty);
    return () => {
      el.removeEventListener("beforeinput", onBeforeInput);
      el.removeEventListener("input", keepEmpty);
      el.removeEventListener("compositionend", keepEmpty);
    };
  }, [pressText, pressBackspace, finishZen, config.mode, snapshot.status]);

  const onInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    const native = e.nativeEvent;
    if (
      native.isComposing ||
      native.keyCode === 229 ||
      e.key === "Unidentified" ||
      e.key === "Process"
    ) {
      return;
    }
    unlockAudio();
    handleKey(native);
    if (isTypingKey(e.key, e.code)) lastKeyHandledAt.current = Date.now();
  };

  // Keystroke sounds.
  useEffect(() => {
    const ev = snapshot.lastEvent;
    if (!ev || ev.id === lastEventId.current) return;
    lastEventId.current = ev.id;
    if (ev.kind === "back") return;
    if (!ev.correct && soundOnError) playKey(voice, { error: true });
    else playKey(voice);
  }, [snapshot.lastEvent, voice, soundOnError]);

  // Persist finished runs once.
  useEffect(() => {
    const raw = snapshot.result;
    if (!raw || savedResultId.current === raw.id) return;
    savedResultId.current = raw.id;

    const result: RunResult = configKeyOverride
      ? {
          ...raw,
          configKey: configKeyOverride,
          configLabel: dailyDate ? `daily ${dailyDate}` : raw.configLabel,
        }
      : raw;

    void addRun(result);
    playFanfare();
    onFinishRef.current?.(result);
    void recordRun(result, {
      theme: themeRef.current,
      isDaily: Boolean(dailyDate),
      dailyDate,
    }).then((newly) => {
      for (const id of newly) {
        const def = achievementById(id);
        if (def) {
          pushToast({
            kind: "achievement",
            title: def.label,
            body: def.blurb,
          });
        }
      }
    });
  }, [snapshot.result, configKeyOverride, dailyDate]);

  const running = snapshot.status === "running";
  const finished = snapshot.status === "finished";
  const wordsFocused = inputFocused || finished;

  return (
    <div className="flex w-full flex-col gap-8">
      {!lockedConfig && (
        <motion.div
          animate={{
            opacity: running && focusMode && inputFocused ? 0.15 : 1,
            y: running && focusMode && inputFocused ? -4 : 0,
          }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-3"
        >
          {progress.streak.current > 0 && (
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--text-faint)]">
              <span className="text-[var(--primary)]">&#9650;</span>{" "}
              {progress.streak.current} day streak
            </span>
          )}
          <ModeBar onAnyChange={restartRun} />
        </motion.div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <RunHud snapshot={snapshot} bestWpm={best?.wpm ?? null} />
          <MetronomePulse intervalMs={snapshot.keyIntervalMs} running={running} />
        </div>

        <div className="panel relative px-5 py-7 sm:px-8 sm:py-9">
          {needsCustomText ? (
            <div className="flex min-h-[9rem] flex-col items-center justify-center gap-3 text-center">
              <span className="mono-label">Custom mode</span>
              <p className="max-w-sm text-sm text-[var(--text-dim)]">
                Paste a passage in the mode bar above and it becomes the text you
                type against. Your bests and ghost are tracked per passage.
              </p>
            </div>
          ) : (
            <div className="relative">
              <WordStream
                snapshot={snapshot}
                focused={wordsFocused}
                onFocusRequest={focusInput}
              />

              <input
                ref={inputRef}
                type="text"
                defaultValue=""
                onKeyDown={onInputKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                inputMode="text"
                aria-label="Type the words shown above"
                style={{ outline: "none" }}
                className="absolute inset-0 z-10 h-full w-full cursor-text bg-transparent text-[16px] text-transparent caret-transparent"
              />

              <AnimatePresence>
                {!inputFocused && !finished && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={focusInput}
                  whileHover="hover"
                  whileTap="tap"
                  className="absolute inset-0 z-20 flex items-center justify-center bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] backdrop-blur-[2px]"
                >
                  <motion.span
                    variants={{ hover: { y: -2 }, tap: { scale: 0.96 } }}
                    className="rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--text-dim)]"
                  >
                    {running ? "tap to keep typing" : "click or tap to start"}
                  </motion.span>
                </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}

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
          <motion.button
            type="button"
            onClick={restartRun}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="self-start rounded-[var(--radius)] border border-[var(--border-strong)] px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--text-dim)] transition-colors hover:border-[var(--primary)] hover:text-[var(--text)]"
          >
            {config.mode === "zen" && running ? "finish  (enter)" : "restart  (tab)"}
          </motion.button>
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
              onNext={restartRun}
              onRepeat={restartRun}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showGraph && running && snapshot.samples.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: focusMode && inputFocused ? 0.25 : 1 }}
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
