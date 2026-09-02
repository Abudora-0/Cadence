"use client";

import { motion } from "motion/react";
import clsx from "clsx";

interface TogglePillProps {
  label: string;
  active: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}

export function TogglePill({ label, active, onChange, icon }: TogglePillProps) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={() => onChange(!active)}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        "group inline-flex items-center gap-2 rounded-[var(--radius)] border px-2.5 py-1.5",
        "font-mono text-[0.62rem] uppercase tracking-[0.16em] transition-colors",
        active
          ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--text)]"
          : "border-[var(--border)] text-[var(--text-faint)] hover:border-[var(--border-strong)] hover:text-[var(--text-dim)]",
      )}
    >
      <span
        className={clsx(
          "relative h-3 w-5 rounded-full border transition-colors",
          active ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border-strong)]",
        )}
      >
        <motion.span
          className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
          style={{ background: active ? "var(--primary-ink)" : "var(--text-faint)" }}
          animate={{ left: active ? "0.62rem" : "0.12rem" }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        />
      </span>
      {icon}
      {label}
    </motion.button>
  );
}
