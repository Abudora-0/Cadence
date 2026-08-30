"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  meta?: string;
}

interface ThemedSelectProps<T extends string> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

export function ThemedSelect<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: ThemedSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const openMenu = () => {
    setActiveIdx(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const commit = (idx: number) => {
    const opt = options[idx];
    if (opt) onChange(opt.value);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={clsx("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openMenu();
          }
        }}
        className={clsx(
          "group flex w-full items-center justify-between gap-3 rounded-[var(--radius)] border px-3 py-2",
          "border-[var(--border)] bg-[var(--surface)] text-left font-mono text-[0.72rem] uppercase tracking-[0.16em]",
          "text-[var(--text-dim)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]",
        )}
      >
        <span className="truncate">{current.label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[var(--primary)]"
        >
          <svg width="10" height="7" viewBox="0 0 10 7" fill="none" aria-hidden>
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={clsx(
              "absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-[var(--radius-lg)] border p-1",
              "border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow)] backdrop-blur",
            )}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIdx((i) => (i + 1) % options.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIdx((i) => (i - 1 + options.length) % options.length);
              } else if (e.key === "Enter") {
                e.preventDefault();
                commit(activeIdx);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          >
            {options.map((opt, idx) => {
              const selected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    tabIndex={-1}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => commit(idx)}
                    className={clsx(
                      "flex w-full items-center justify-between gap-3 rounded-[var(--radius)] px-2.5 py-1.5",
                      "font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors",
                      idx === activeIdx
                        ? "bg-[var(--primary-dim)] text-[var(--text)]"
                        : "text-[var(--text-faint)]",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={clsx(
                          "h-1.5 w-1.5 rounded-full transition-colors",
                          selected ? "bg-[var(--primary)]" : "bg-[var(--border-strong)]",
                        )}
                      />
                      {opt.label}
                    </span>
                    {opt.meta && <span className="opacity-50">{opt.meta}</span>}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
