"use client";

import { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import clsx from "clsx";

interface CounterProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Reel({ digit, reduce }: { digit: number; reduce: boolean }) {
  return (
    <span
      className="relative inline-block overflow-hidden tabular-nums"
      style={{ height: "1em", width: "0.62em" }}
      aria-hidden
    >
      <motion.span
        className="absolute left-0 top-0 flex flex-col items-center"
        animate={{ y: `-${digit}em` }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 30 }
        }
      >
        {DIGITS.map((d) => (
          <span key={d} className="flex items-center justify-center" style={{ height: "1em" }}>
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export const AnimatedCounter = memo(function AnimatedCounter({
  value,
  decimals = 0,
  suffix,
  className,
}: CounterProps) {
  const reduce = useReducedMotion() ?? false;
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  const text = safe.toFixed(decimals);

  return (
    <span
      className={clsx("inline-flex items-baseline leading-none", className)}
      role="text"
      aria-label={`${text}${suffix ?? ""}`}
    >
      {text.split("").map((ch, i) =>
        ch >= "0" && ch <= "9" ? (
          <Reel key={i} digit={Number(ch)} reduce={reduce} />
        ) : (
          <span key={i} className="inline-block">
            {ch}
          </span>
        ),
      )}
      {suffix && <span className="ml-1 text-[0.5em] tracking-widest opacity-60">{suffix}</span>}
    </span>
  );
});
