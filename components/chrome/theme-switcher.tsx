"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { THEMES } from "@/lib/themes";
import { setTheme, useTheme } from "@/lib/store/theme-store";

export function ThemeSwitcher() {
  const active = useTheme();
  const [open, setOpen] = useState(false);
  const current = THEMES.find((t) => t.id === active) ?? THEMES[0];

  return (
    <div
      className="relative"
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Change theme"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] px-2.5 py-1.5 transition-colors hover:border-[var(--border-strong)]"
      >
        <span className="flex gap-1">
          {current.swatch.map((c, i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-[2px] border border-black/20"
              style={{ background: c }}
            />
          ))}
        </span>
        <span className="hidden font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--text-dim)] sm:inline">
          {current.label}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-50 w-56 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-1.5 shadow-[var(--shadow)] backdrop-blur"
          >
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  setTheme(theme.id);
                  setOpen(false);
                }}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-[var(--radius)] px-2.5 py-2 text-left transition-colors",
                  theme.id === active
                    ? "bg-[var(--primary-dim)]"
                    : "hover:bg-[var(--surface)]",
                )}
              >
                <span className="flex gap-1">
                  {theme.swatch.map((c, i) => (
                    <span
                      key={i}
                      className="h-4 w-4 rounded-[3px] border border-black/20"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                <span className="flex flex-col">
                  <span className="text-[0.8rem] text-[var(--text)]">{theme.label}</span>
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-faint)]">
                    {theme.blurb}
                  </span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
