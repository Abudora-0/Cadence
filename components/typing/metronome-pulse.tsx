"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { playMetronome } from "@/lib/audio/sound-engine";
import { bpmFromInterval } from "@/lib/typing/stats";
import { useSettings } from "@/lib/store/settings-store";

interface MetronomePulseProps {
  intervalMs: number;
  running: boolean;
}

export function MetronomePulse({ intervalMs, running }: MetronomePulseProps) {
  const audible = useSettings((s) => s.metronome);
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(0);
  const beatRef = useRef(0);

  const clamped =
    intervalMs > 0 ? Math.min(1200, Math.max(90, intervalMs)) : 0;
  const bpm = clamped > 0 ? Math.round(bpmFromInterval(clamped)) : 0;

  useEffect(() => {
    if (!running || clamped === 0) return;
    const id = window.setInterval(() => {
      beatRef.current = (beatRef.current + 1) % 4;
      setBeat(beatRef.current);
      if (audible) playMetronome(beatRef.current === 0);
    }, clamped);
    return () => window.clearInterval(id);
  }, [running, clamped, audible]);

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-5 w-5">
        <motion.span
          key={beat}
          className="absolute inset-0 rounded-full border border-[var(--primary)]"
          initial={{ scale: 0.5, opacity: 0.9 }}
          animate={reduce ? { opacity: 0.6 } : { scale: 1.9, opacity: 0 }}
          transition={{ duration: clamped ? clamped / 1000 : 0.4, ease: "easeOut" }}
        />
        <span className="absolute inset-[6px] rounded-full bg-[var(--primary)]" />
      </div>
      <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--text-faint)]">
        {bpm > 0 ? `${bpm} bpm` : "-- bpm"}
      </span>
    </div>
  );
}
