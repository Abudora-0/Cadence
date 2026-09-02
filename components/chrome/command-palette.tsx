"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { THEMES } from "@/lib/themes";
import { cycleTheme, setTheme } from "@/lib/store/theme-store";
import { useSettings } from "@/lib/store/settings-store";
import type { Mode } from "@/lib/typing/types";

const THEME_ORDER = THEMES.map((t) => t.id);

interface Command {
  id: string;
  label: string;
  group: string;
  hint?: string;
  run: () => void;
}

export function CommandPalette({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const setMode = useSettings((s) => s.setMode);

  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const openPalette = useCallback(() => {
    setQuery("");
    setActive(0);
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (openRef.current) setOpen(false);
        else openPalette();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPalette]);

  const commands = useMemo<Command[]>(() => {
    const modeCmd = (m: Mode, label: string): Command => ({
      id: `mode-${m}`,
      label: `Mode: ${label}`,
      group: "Practice",
      run: () => {
        setMode(m);
        router.push("/practice");
      },
    });
    return [
      modeCmd("time", "Time attack"),
      modeCmd("words", "Word sprint"),
      modeCmd("quote", "Quote"),
      modeCmd("code", "Code"),
      modeCmd("zen", "Zen"),
      modeCmd("custom", "Custom text"),
      {
        id: "nav-practice",
        label: "Go to Practice",
        group: "Navigate",
        run: () => router.push("/practice"),
      },
      {
        id: "nav-daily",
        label: "Go to Daily challenge",
        group: "Navigate",
        run: () => router.push("/daily"),
      },
      {
        id: "nav-stats",
        label: "Go to Stats",
        group: "Navigate",
        run: () => router.push("/stats"),
      },
      {
        id: "nav-about",
        label: "Go to About",
        group: "Navigate",
        run: () => router.push("/about"),
      },
      {
        id: "nav-home",
        label: "Go to Home",
        group: "Navigate",
        hint: "landing",
        run: () => router.push("/"),
      },
      {
        id: "open-settings",
        label: "Open tuning panel",
        group: "Navigate",
        hint: "settings",
        run: onOpenSettings,
      },
      {
        id: "theme-cycle",
        label: "Cycle theme",
        group: "Appearance",
        hint: "shift + t",
        run: () => cycleTheme(THEME_ORDER),
      },
      ...THEMES.map<Command>((t) => ({
        id: `theme-${t.id}`,
        label: `Theme: ${t.label}`,
        group: "Appearance",
        hint: t.blurb,
        run: () => setTheme(t.id),
      })),
    ];
  }, [router, setMode, onOpenSettings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      (c.label + " " + (c.hint ?? "")).toLowerCase().includes(q),
    );
  }, [commands, query]);

  const runActive = () => {
    const cmd = filtered[active];
    if (cmd) {
      cmd.run();
      setOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/55 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="w-full max-w-lg overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow)]"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
              <span className="font-mono text-[var(--primary)]">/</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((i) => Math.min(filtered.length - 1, i + 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((i) => Math.max(0, i - 1));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    runActive();
                  }
                }}
                placeholder="Type a command"
                className="w-full bg-transparent font-mono text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:outline-none"
              />
              <kbd className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-widest text-[var(--text-faint)]">
                esc
              </kbd>
            </div>

            <ul className="max-h-80 overflow-y-auto p-1.5">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                  nothing matches
                </li>
              )}
              {filtered.map((cmd, i) => (
                <li key={cmd.id}>
                  <motion.button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={runActive}
                    animate={{ x: i === active ? 3 : 0 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                    className={clsx(
                      "flex w-full items-center justify-between gap-3 rounded-[var(--radius)] px-3 py-2 text-left transition-colors",
                      i === active ? "bg-[var(--primary-dim)]" : "",
                    )}
                  >
                    <span className="text-[0.82rem] text-[var(--text)]">{cmd.label}</span>
                    <span className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                      {cmd.hint ?? cmd.group}
                    </span>
                  </motion.button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
