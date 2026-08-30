"use client";

import { motion, useReducedMotion } from "motion/react";
import clsx from "clsx";

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  animated?: boolean;
  className?: string;
}

// Each bar has a rest height and an animation pattern that loops out of phase
// with its neighbours, so the mark reads as a running waveform.
const BARS = [
  { x: 4, rest: 10, peak: 20, delay: 0 },
  { x: 9.5, rest: 18, peak: 28, delay: 0.18 },
  { x: 15, rest: 6, peak: 24, delay: 0.36 },
  { x: 20.5, rest: 22, peak: 30, delay: 0.12 },
  { x: 26, rest: 12, peak: 18, delay: 0.28 },
];

export function CadenceLogo({
  size = 32,
  withWordmark = false,
  animated = true,
  className,
}: LogoProps) {
  const reduce = useReducedMotion();
  const play = animated && !reduce;

  return (
    <span className={clsx("inline-flex items-center gap-3 select-none", className)}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        role="img"
        aria-label="Cadence"
        initial={false}
        whileHover={play ? { scale: 1.06 } : undefined}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="cadence-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>

        <rect
          x="0.75"
          y="0.75"
          width="30.5"
          height="30.5"
          rx="8"
          fill="var(--surface-2)"
          stroke="var(--border-strong)"
          strokeWidth="1.2"
        />

        {BARS.map((bar, i) => {
          const cy = 16;
          return (
            <motion.rect
              key={i}
              x={bar.x}
              width={2.4}
              rx={1.2}
              fill="url(#cadence-bar)"
              initial={{ height: bar.rest, y: cy - bar.rest / 2 }}
              animate={
                play
                  ? {
                      height: [bar.rest, bar.peak, bar.rest * 0.7, bar.rest],
                      y: [
                        cy - bar.rest / 2,
                        cy - bar.peak / 2,
                        cy - (bar.rest * 0.7) / 2,
                        cy - bar.rest / 2,
                      ],
                    }
                  : { height: bar.rest, y: cy - bar.rest / 2 }
              }
              transition={
                play
                  ? {
                      duration: 1.6,
                      delay: bar.delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
                  : { duration: 0.3 }
              }
            />
          );
        })}
      </motion.svg>

      {withWordmark && (
        <span
          className="text-[1.15rem] font-semibold tracking-[0.34em] uppercase"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Cadence
        </span>
      )}
    </span>
  );
}
