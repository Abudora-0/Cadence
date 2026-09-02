"use client";

import { useId } from "react";
import { motion } from "motion/react";
import clsx from "clsx";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  hint?: string;
}

interface SegmentedProps<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  ariaLabel: string;
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  size = "md",
  ariaLabel,
}: SegmentedProps<T>) {
  const layoutId = useId();

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={clsx(
        "relative inline-flex items-center gap-0.5 rounded-[var(--radius)] border p-0.5",
        "border-[var(--border)] bg-[var(--surface)]",
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <motion.button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            title={opt.hint}
            onClick={() => onChange(opt.value)}
            whileTap={{ scale: 0.94 }}
            className={clsx(
              "relative z-10 rounded-[calc(var(--radius)-1px)] font-mono uppercase tracking-[0.14em] transition-colors",
              size === "sm" ? "px-2.5 py-1 text-[0.62rem]" : "px-3.5 py-1.5 text-[0.68rem]",
              active
                ? "text-[var(--primary-ink)]"
                : "text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--text-dim)]",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${layoutId}`}
                className="absolute inset-0 -z-10 rounded-[calc(var(--radius)-1px)] bg-[var(--primary)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}
