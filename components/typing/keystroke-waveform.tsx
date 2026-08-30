"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type { EngineSnapshot } from "@/lib/typing/use-typing-engine";

interface WaveformProps {
  lastEvent: EngineSnapshot["lastEvent"];
  running: boolean;
  height?: number;
}

interface Bar {
  h: number;
  correct: boolean;
  kind: "char" | "space" | "back";
  age: number;
}

function readVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function KeystrokeWaveform({ lastEvent, running, height = 64 }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<Bar[]>([]);
  const seenId = useRef<number>(-1);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!lastEvent || lastEvent.id === seenId.current) return;
    seenId.current = lastEvent.id;
    const base =
      lastEvent.kind === "space" ? 0.32 : lastEvent.kind === "back" ? 0.2 : 0.55;
    const jitter = Math.random() * 0.4;
    barsRef.current.push({
      h: Math.min(1, base + jitter),
      correct: lastEvent.correct,
      kind: lastEvent.kind,
      age: 0,
    });
    if (barsRef.current.length > 160) barsRef.current.shift();
  }, [lastEvent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const primary = readVar("--primary", "#7cf7d0");
      const incorrect = readVar("--incorrect", "#ff6b6b");
      const faint = readVar("--text-faint", "#5a5b66");

      const mid = h / 2;
      ctx.strokeStyle = faint;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();
      ctx.globalAlpha = 1;

      const bars = barsRef.current;
      const barW = 3;
      // Bars scroll left at a fixed rate; the spacing between them mirrors the
      // real time gap between your keystrokes.
      const speed = reduce ? 0 : 2.2;

      for (let i = 0; i < bars.length; i += 1) {
        const bar = bars[i];
        bar.age += speed;
        const px = w - bar.age;
        if (px < -barW) continue;
        const amp = bar.h * (h / 2 - 4);
        const fade = Math.max(0, 1 - bar.age / w);
        ctx.globalAlpha = 0.25 + fade * 0.75;
        ctx.fillStyle = bar.correct ? primary : incorrect;
        ctx.fillRect(px, mid - amp, barW, amp * 2);
      }
      ctx.globalAlpha = 1;

      // Trim bars that have fully scrolled off the left edge.
      barsRef.current = bars.filter((b) => w - b.age > -barW);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height, opacity: running ? 1 : 0.4, transition: "opacity 0.4s" }}
      aria-hidden
    />
  );
}
