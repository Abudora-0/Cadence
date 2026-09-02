"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { onPulse } from "@/lib/landing/pulse-bus";

function readVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

/**
 * Ambient sine band behind the hero. Idles as a low sine and spikes on each
 * keystroke fed through the pulse bus.
 */
export function HeroOscilloscope({ height = 160 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const spikesRef = useRef<{ pos: number; amp: number; correct: boolean }[]>([]);

  useEffect(() => {
    return onPulse((correct) => {
      spikesRef.current.push({ pos: 1, amp: correct ? 1 : 1.3, correct });
      if (spikesRef.current.length > 48) spikesRef.current.shift();
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0;
    let t = 0;

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
      const mid = h / 2;
      ctx.clearRect(0, 0, w, h);

      const primary = readVar("--primary", "#7cf7d0");
      const accent = readVar("--accent", "#b8a6ff");
      const incorrect = readVar("--incorrect", "#ff6b6b");

      t += reduce ? 0 : 0.02;

      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, primary);
      grad.addColorStop(0.6, accent);
      grad.addColorStop(1, primary);

      ctx.lineWidth = 2;
      ctx.strokeStyle = grad;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();

      const spikes = spikesRef.current;
      for (let px = 0; px <= w; px += 2) {
        const nx = px / w;
        let y = Math.sin(nx * 9 + t) * (h * 0.06);
        y += Math.sin(nx * 21 - t * 1.7) * (h * 0.02);

        for (const s of spikes) {
          const d = Math.abs(nx - s.pos);
          if (d < 0.06) {
            y += Math.sin((1 - d / 0.06) * Math.PI) * s.amp * (h * 0.28);
          }
        }

        if (px === 0) ctx.moveTo(px, mid + y);
        else ctx.lineTo(px, mid + y);
      }
      ctx.stroke();

      // Any spike carrying a mistake gets a red echo underneath.
      if (spikes.some((s) => !s.correct)) {
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = incorrect;
        ctx.beginPath();
        for (let px = 0; px <= w; px += 3) {
          const nx = px / w;
          let y = 0;
          for (const s of spikes) {
            if (s.correct) continue;
            const d = Math.abs(nx - s.pos);
            if (d < 0.05) {
              y += Math.sin((1 - d / 0.05) * Math.PI) * (h * 0.22);
            }
          }
          if (px === 0) ctx.moveTo(px, mid + y);
          else ctx.lineTo(px, mid + y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const speed = reduce ? 0 : 0.006;
      spikesRef.current = spikes
        .map((s) => ({ ...s, pos: s.pos - speed, amp: s.amp * 0.985 }))
        .filter((s) => s.pos > -0.1 && s.amp > 0.02);

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
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-1/2 h-40 w-full -translate-y-1/2 opacity-55"
      style={{ height }}
    />
  );
}
