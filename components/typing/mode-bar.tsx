"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Segmented } from "@/components/ui/segmented";
import { ThemedSelect } from "@/components/ui/themed-select";
import { TogglePill } from "@/components/ui/toggle-pill";
import { useSettings } from "@/lib/store/settings-store";
import { isUsableCustomText } from "@/lib/typing/custom-text";
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

  const fire = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    onAnyChange();
  };

  return (
    <motion.div
      layout
      className="panel flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3"
    >
      <Segmented
        ariaLabel="Practice mode"
        options={MODES}
        value={config.mode}
        onChange={fire(setMode)}
      />

      <span className="h-5 w-px bg-[var(--border)]" />

      <AnimatePresence initial={false}>
        {config.mode === "time" && (
          <motion.div
            key="time"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.16 }}
          >
            <Segmented
              size="sm"
              ariaLabel="Seconds"
              options={TIME_OPTIONS.map((t) => ({ value: t, label: `${t}s` }))}
              value={config.timeSec}
              onChange={fire(setTime)}
            />
          </motion.div>
        )}

        {config.mode === "words" && (
          <motion.div
            key="words"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.16 }}
          >
            <Segmented
              size="sm"
              ariaLabel="Word count"
              options={WORD_OPTIONS.map((w) => ({ value: w, label: String(w) }))}
              value={config.wordCount}
              onChange={fire(setWordCount)}
            />
          </motion.div>
        )}

        {config.mode === "code" && (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.16 }}
          >
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
          </motion.div>
        )}

        {config.mode === "custom" && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.16 }}
            className="flex items-center gap-3"
          >
            <button
              type="button"
              onClick={() => setTextModalOpen(true)}
              className="rounded-[var(--radius)] border border-[var(--border-strong)] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-dim)] transition-colors hover:border-[var(--primary)] hover:text-[var(--text)]"
            >
              {isUsableCustomText(customText) ? "Edit text" : "Paste text"}
            </button>
            {isUsableCustomText(customText) && (
              <span className="max-w-[16rem] truncate font-mono text-[0.62rem] text-[var(--text-faint)]">
                {customText.replace(/\s+/g, " ").trim().slice(0, 60)}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {(config.mode === "time" || config.mode === "words") && (
        <>
          <ThemedSelect<Language>
            ariaLabel="Word list"
            className="w-36"
            options={[
              { value: "english", label: "English 200" },
              { value: "english-1k", label: "English wide" },
            ]}
            value={config.language}
            onChange={fire(setLanguage)}
          />
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
        </>
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
