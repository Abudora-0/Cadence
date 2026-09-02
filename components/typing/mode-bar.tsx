"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Segmented } from "@/components/ui/segmented";
import { ThemedSelect } from "@/components/ui/themed-select";
import { TogglePill } from "@/components/ui/toggle-pill";
import { useSettings } from "@/lib/store/settings-store";
import { useHistory } from "@/lib/store/history-store";
import { isUsableCustomText } from "@/lib/typing/custom-text";
import { LANGUAGES } from "@/lib/typing/languages";
import { aggregateKeyStats, weakKeys } from "@/lib/typing/weak-keys";
import {
  TIME_OPTIONS,
  WORD_OPTIONS,
  type CodeLang,
  type Language,
  type Mode,
} from "@/lib/typing/types";
import { CustomTextModal } from "./custom-text-modal";

const MODES: { value: Mode; label: string }[] = [
  { value: "time", label: "Time" },
  { value: "words", label: "Words" },
  { value: "quote", label: "Quote" },
  { value: "code", label: "Code" },
  { value: "zen", label: "Zen" },
  { value: "custom", label: "Custom" },
  { value: "drill", label: "Weak keys" },
];

export function ModeBar({ onAnyChange }: { onAnyChange: () => void }) {
  const config = useSettings((s) => s.config);
  const setMode = useSettings((s) => s.setMode);
  const customText = useSettings((s) => s.customText);
  const setCustomText = useSettings((s) => s.setCustomText);
  const [textModalOpen, setTextModalOpen] = useState(false);
  const setTime = useSettings((s) => s.setTime);
  const setWordCount = useSettings((s) => s.setWordCount);
  const setLanguage = useSettings((s) => s.setLanguage);
  const setCodeLang = useSettings((s) => s.setCodeLang);
  const togglePunctuation = useSettings((s) => s.togglePunctuation);
  const toggleNumbers = useSettings((s) => s.toggleNumbers);

  const { runs } = useHistory();
  const weak = useMemo(
    () => weakKeys(aggregateKeyStats(runs)),
    [runs],
  );

  const fire = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    onAnyChange();
  };

  const showLanguage =
    config.mode === "time" ||
    config.mode === "words" ||
    config.mode === "drill";

  return (
    <motion.div
      layout
      className="panel flex flex-wrap items-center gap-x-3 gap-y-3 px-3 py-3 sm:gap-x-5 sm:px-4"
    >
      <Segmented
        ariaLabel="Practice mode"
        options={MODES}
        value={config.mode}
        onChange={fire(setMode)}
      />

      <span className="hidden h-5 w-px bg-[var(--border)] sm:block" />

      {config.mode === "time" && (
        <div key="time" className="rise-in">
          <Segmented
            size="sm"
            ariaLabel="Seconds"
            options={TIME_OPTIONS.map((t) => ({ value: t, label: `${t}s` }))}
            value={config.timeSec}
            onChange={fire(setTime)}
          />
        </div>
      )}

      {config.mode === "words" && (
        <div key="words" className="rise-in">
          <Segmented
            size="sm"
            ariaLabel="Word count"
            options={WORD_OPTIONS.map((w) => ({ value: w, label: String(w) }))}
            value={config.wordCount}
            onChange={fire(setWordCount)}
          />
        </div>
      )}

      {config.mode === "code" && (
        <div key="code" className="rise-in">
          <ThemedSelect<CodeLang>
            ariaLabel="Language"
            className="w-40"
            options={[
              { value: "javascript", label: "JavaScript" },
              { value: "python", label: "Python" },
            ]}
            value={config.codeLang}
            onChange={fire(setCodeLang)}
          />
        </div>
      )}

      {config.mode === "custom" && (
        <div key="custom" className="rise-in flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setTextModalOpen(true)}
            className="rounded-[var(--radius)] border border-[var(--border-strong)] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-dim)] transition-colors hover:border-[var(--primary)] hover:text-[var(--text)]"
          >
            {isUsableCustomText(customText) ? "Edit text" : "Paste text"}
          </button>
          {isUsableCustomText(customText) && (
            <span className="max-w-full truncate font-mono text-[0.62rem] text-[var(--text-faint)] sm:max-w-[16rem]">
              {customText.replace(/\s+/g, " ").trim().slice(0, 60)}
            </span>
          )}
        </div>
      )}

      {showLanguage && (
        <ThemedSelect<Language>
          ariaLabel="Language"
          className="w-40"
          options={LANGUAGES.map((l) => ({ value: l.id, label: l.label }))}
          value={config.language}
          onChange={fire(setLanguage)}
        />
      )}

      {(config.mode === "time" || config.mode === "words") && (
        <div className="flex items-center gap-2">
          <TogglePill
            label="Punct"
            active={config.punctuation}
            onChange={() => {
              togglePunctuation();
              onAnyChange();
            }}
          />
          <TogglePill
            label="Numbers"
            active={config.numbers}
            onChange={() => {
              toggleNumbers();
              onAnyChange();
            }}
          />
        </div>
      )}

      {config.mode === "drill" && (
        <p
          key="drill-hint"
          className="rise-in w-full font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--text-faint)]"
        >
          {weak.basedOnHistory
            ? "targeting your weakest keys: "
            : "not enough data yet, drilling common hard keys: "}
          <span className="text-[var(--incorrect)]">{weak.keys.join(" ")}</span>
        </p>
      )}

      <CustomTextModal
        open={textModalOpen}
        initialText={customText}
        onClose={() => setTextModalOpen(false)}
        onSave={(text) => {
          setCustomText(text);
          onAnyChange();
        }}
      />
    </motion.div>
  );
}
