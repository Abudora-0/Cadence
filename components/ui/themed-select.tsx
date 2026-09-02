"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const MENU_MAX_PX = 256;
const GAP = 4;

interface MenuPos {
  left: number;
  top: number;
  width: number;
  dropUp: boolean;
}

export function ThemedSelect<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: ThemedSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  const measure = useCallback((): MenuPos | null => {
    const el = rootRef.current;
    if (!el || typeof window === "undefined") return null;
    const r = el.getBoundingClientRect();
    const needed = Math.min(MENU_MAX_PX, options.length * 30 + 8);
    const below = window.innerHeight - r.bottom;
    const dropUp = below < needed + GAP && r.top > below;
    return {
      left: r.left,
      width: r.width,
      dropUp,
      top: dropUp ? r.top - GAP : r.bottom + GAP,
    };
  }, [options.length]);

  useLayoutEffect(() => {
    if (!open) return;
    const sync = () => {
      const next = measure();
      if (next) setPos(next);
    };
    sync();
    window.addEventListener("scroll", sync, true);
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync, true);
      window.removeEventListener("resize", sync);
    };
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  const openMenu = () => {
    setActiveIdx(Math.max(0, options.findIndex((o) => o.value === value)));
    setPos(measure());
    setOpen(true);
  };

  const commit = (idx: number) => {
    const opt = options[idx];
    if (opt) onChange(opt.value);
    setOpen(false);
  };

  const menu =
    open && pos ? (
      <motion.ul
        ref={menuRef}
        role="listbox"
        aria-label={ariaLabel}
        initial={{ opacity: 0, y: pos.dropUp ? 6 : -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: pos.dropUp ? 6 : -6, scale: 0.98 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          left: pos.left,
          width: pos.width,
          ...(pos.dropUp
            ? { bottom: window.innerHeight - pos.top }
            : { top: pos.top }),
          maxHeight: MENU_MAX_PX,
        }}
        className={clsx(
          "z-[55] overflow-y-auto overscroll-contain rounded-[var(--radius-lg)] border p-1",
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
              <motion.button
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => commit(idx)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
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
              </motion.button>
            </li>
          );
        })}
      </motion.ul>
    ) : null;

  return (
    <div ref={rootRef} className={clsx("relative", className)}>
      <motion.button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        whileTap={{ scale: 0.98 }}
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
      </motion.button>

      {typeof document !== "undefined"
        ? createPortal(<AnimatePresence>{menu}</AnimatePresence>, document.body)
        : null}
    </div>
  );
}
