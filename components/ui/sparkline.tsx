"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

interface SparklineProps {
  values: number[];
  height?: number;
  strokeWidth?: number;
}

export function Sparkline({ values, height = 60, strokeWidth = 2 }: SparklineProps) {
  const width = 320;
  const { path, area, dot } = useMemo(() => {
    if (values.length < 2) {
      return { path: "", area: "", dot: null as null | { x: number; y: number } };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const x = (i: number) => (i / (values.length - 1)) * width;
    const y = (v: number) => height - 4 - ((v - min) / span) * (height - 8);
    const d = values
      .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join(" ");
    return {
      path: d,
      area: `${d} L${width},${height} L0,${height} Z`,
      dot: { x: x(values.length - 1), y: y(values[values.length - 1]) },
    };
  }, [values, height]);

  if (!path) {
    return (
      <div
        className="flex items-center justify-center font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--text-faint)]"
        style={{ height }}
      >
        not enough data
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <motion.path
        d={path}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      {dot && <circle cx={dot.x} cy={dot.y} r={3} fill="var(--primary)" />}
    </svg>
  );
}
