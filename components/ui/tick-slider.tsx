"use client";

import { useCallback, useRef } from "react";
import { motion } from "motion/react";
import clsx from "clsx";

interface TickSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
  format?: (v: number) => string;
}

export function TickSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  ariaLabel,
  format = (v) => String(v),
}: TickSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = ((value - min) / (max - min)) * 100;

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      const snapped = Math.round(raw / step) * step;
      onChange(Math.min(max, Math.max(min, snapped)));
    },
    [min, max, step, onChange],
  );

  const tickCount = Math.min(40, Math.floor((max - min) / step) + 1);

  return (
    <div
      className="flex items-center gap-3"
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          onChange(Math.min(max, value + step));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          onChange(Math.max(min, value - step));
        }
      }}
    >
      <div
        ref={trackRef}
        className="relative h-8 flex-1 cursor-pointer select-none"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) setFromClientX(e.clientX);
        }}
      >
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
          {Array.from({ length: tickCount }).map((_, i) => {
            const tickPct = (i / (tickCount - 1)) * 100;
            const passed = tickPct <= pct;
            const major = i % 5 === 0 || i === tickCount - 1;
            return (
              <span
                key={i}
                className={clsx(
                  "w-px transition-colors",
                  major ? "h-3.5" : "h-2",
                  passed ? "bg-[var(--primary)]" : "bg-[var(--border-strong)]",
                )}
              />
            );
          })}
        </div>
        <motion.span
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-[var(--primary)] bg-[var(--surface)] shadow-[0_0_14px_var(--glow)]"
          animate={{ left: `${pct}%` }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 1.25 }}
          transition={{ type: "spring", stiffness: 480, damping: 34 }}
        />
      </div>
      <span className="w-14 text-right font-mono text-[0.72rem] tabular-nums text-[var(--primary)]">
        {format(value)}
      </span>
    </div>
  );
}
