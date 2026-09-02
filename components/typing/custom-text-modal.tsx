"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CUSTOM_TEXT_MAX_CHARS,
  customTokenCount,
  isUsableCustomText,
} from "@/lib/typing/custom-text";

interface CustomTextModalProps {
  open: boolean;
  initialText: string;
  onClose: () => void;
  onSave: (text: string) => void;
}

export function CustomTextModal({
  open,
  initialText,
  onClose,
  onSave,
}: CustomTextModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/55 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Panel
            initialText={initialText}
            onClose={onClose}
            onSave={onSave}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Panel({
  initialText,
  onClose,
  onSave,
}: Omit<CustomTextModalProps, "open">) {
  const [draft, setDraft] = useState(initialText);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tokens = customTokenCount(draft);
  const usable = isUsableCustomText(draft);
  const over = draft.length >= CUSTOM_TEXT_MAX_CHARS;

  return (
    <motion.div
      className="w-full max-w-xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow)]"
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[var(--text-dim)]">
          Custom text
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-widest text-[var(--text-faint)] hover:text-[var(--text)]"
        >
          esc
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <textarea
          value={draft}
          onChange={(e) =>
            setDraft(e.target.value.slice(0, CUSTOM_TEXT_MAX_CHARS))
          }
          rows={8}
          autoFocus
          placeholder="Paste a passage to type against. Line breaks show as a return token."
          className="w-full resize-y rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3 font-mono text-sm leading-relaxed text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--primary)] focus:outline-none"
        />
        <div className="flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text-faint)]">
          <span>
            {tokens} words · {draft.length}/{CUSTOM_TEXT_MAX_CHARS} chars
          </span>
          <span
            className={
              over
                ? "text-[var(--warn)]"
                : usable
                  ? "text-[var(--primary)]"
                  : ""
            }
          >
            {over
              ? "at the character limit"
              : usable
                ? "ready"
                : "paste some text"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-4 py-3">
        <button
          type="button"
          onClick={() => {
            onSave("");
            onClose();
          }}
          className="rounded-[var(--radius)] border border-[var(--border-strong)] px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-faint)] transition-colors hover:text-[var(--text)]"
        >
          Clear
        </button>
        <button
          type="button"
          disabled={!usable}
          onClick={() => {
            onSave(draft);
            onClose();
          }}
          className="rounded-[var(--radius)] bg-[var(--primary)] px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--primary-ink)] transition-opacity disabled:opacity-40"
        >
          Use this text
        </button>
      </div>
    </motion.div>
  );
}
