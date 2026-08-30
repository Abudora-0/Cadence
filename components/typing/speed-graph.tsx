"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import type { RunSample } from "@/lib/typing/types";

interface SpeedGraphProps {
  samples: RunSample[];
  height?: number;
  showRaw?: boolean;
  compareWpm?: number | null;
  live?: boolean;
}

const PAD = { top: 12, right: 8, bottom: 18, left: 30 };

export function SpeedGraph({
  samples,
  height = 180,
  showRaw = true,
  compareWpm = null,
  live = false,
}: SpeedGraphProps) {
  const width = 640;

  const { wpmPath, rawPath, area, maxWpm, ticks, errorDots, lastX, lastY } = useMemo(() => {
    const pts = samples.length
      ? samples
      : ([{ t: 0, wpm: 0, raw: 0, acc: 100, errors: 0 }] as RunSample[]);
    const maxT = Math.max(1, pts[pts.length - 1].t);
    const peak = Math.max(
      40,
      ...pts.map((p) => Math.max(p.wpm, showRaw ? p.raw : 0)),
      compareWpm ?? 0,
    );
    const niceMax = Math.ceil(peak / 20) * 20;

    const x = (t: number) => PAD.left + (t / maxT) * (width - PAD.left - PAD.right);
    const y = (v: number) =>
      PAD.top + (1 - v / niceMax) * (height - PAD.top - PAD.bottom);

    const line = (key: "wpm" | "raw") =>
      pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");

    const wpmLine = line("wpm");
    const areaPath =
      `${wpmLine} L${x(pts[pts.length - 1].t).toFixed(1)},${(height - PAD.bottom).toFixed(1)}` +
      ` L${x(pts[0].t).toFixed(1)},${(height - PAD.bottom).toFixed(1)} Z`;

    const tickVals: number[] = [];
    for (let v = 0; v <= niceMax; v += niceMax / 4) tickVals.push(Math.round(v));

    const dots = pts
      .filter((p) => p.errors > 0)
      .map((p) => ({ cx: x(p.t), cy: y(p.wpm), r: Math.min(5, 2 + p.errors) }));

    const last = pts[pts.length - 1];

    return {
      wpmPath: wpmLine,
      rawPath: line("raw"),
      area: areaPath,
      maxWpm: niceMax,
      ticks: tickVals.map((v) => ({ v, y: y(v) })),
      errorDots: dots,
      lastX: x(last.t),
      lastY: y(last.wpm),
    };
  }, [samples, showRaw, compareWpm, height]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Words per minute over time"
    >
      <defs>
        <linearGradient id="speed-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {ticks.map((t) => (
        <g key={t.v}>
          <line
            x1={PAD.left}
            x2={width - PAD.right}
            y1={t.y}
            y2={t.y}
            stroke="var(--border)"
            strokeDasharray="2 4"
          />
          <text
            x={PAD.left - 6}
            y={t.y + 3}
            textAnchor="end"
            className="fill-[var(--text-faint)]"
            style={{ fontFamily: "var(--font-mono)", fontSize: 9 }}
          >
            {t.v}
          </text>
        </g>
      ))}

      {compareWpm != null && compareWpm > 0 && (
        <line
          x1={PAD.left}
          x2={width - PAD.right}
          y1={PAD.top + (1 - compareWpm / maxWpm) * (height - PAD.top - PAD.bottom)}
          y2={PAD.top + (1 - compareWpm / maxWpm) * (height - PAD.top - PAD.bottom)}
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
      )}

      <path d={area} fill="url(#speed-fill)" />

      {showRaw && (
        <motion.path
          d={rawPath}
          fill="none"
          stroke="var(--text-faint)"
          strokeWidth="1.4"
          strokeDasharray="3 3"
          initial={{ pathLength: live ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: live ? 0 : 0.8, ease: "easeOut" }}
        />
      )}

      <motion.path
        d={wpmPath}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: live ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: live ? 0 : 0.9, ease: "easeOut" }}
      />

      {errorDots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="var(--incorrect)" fillOpacity={0.85} />
      ))}

      {live && (
        <circle cx={lastX} cy={lastY} r={3.5} fill="var(--primary)">
          <animate attributeName="r" values="3.5;6;3.5" dur="1.4s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}
