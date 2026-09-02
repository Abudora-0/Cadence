"use client";

import { useEffect, useRef, useState } from "react";
import type { RunResult } from "@/lib/typing/types";

function readVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

export function DailyShareCard({
  result,
  day,
}: {
  result: RunResult;
  day: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1200;
    const H = 630;
    canvas.width = W;
    canvas.height = H;

    const bg = readVar("--bg", "#07070a");
    const primary = readVar("--primary", "#7cf7d0");
    const accent = readVar("--accent", "#b8a6ff");
    const text = readVar("--text", "#f4f4f6");
    const dim = readVar("--text-dim", "#a3a3ad");
    const faint = readVar("--text-faint", "#5a5b66");

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // waveform bars
    const heights = [70, 150, 220, 120, 180, 90, 160];
    heights.forEach((h, i) => {
      ctx.fillStyle = i % 2 === 0 ? primary : accent;
      const x = 80 + i * 30;
      ctx.beginPath();
      ctx.roundRect(x, 90 + (220 - h), 14, h, 7);
      ctx.fill();
    });

    ctx.fillStyle = faint;
    ctx.font = "500 24px ui-monospace, monospace";
    ctx.fillText(`CADENCE DAILY  ·  ${day}`, 80, 370);

    ctx.fillStyle = text;
    ctx.font = "700 96px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillText(`${Math.round(result.wpm)} wpm`, 78, 470);

    ctx.fillStyle = dim;
    ctx.font = "400 34px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillText(
      `${result.accuracy.toFixed(1)}% accuracy   ·   ${Math.round(
        result.consistency,
      )} consistency`,
      80,
      525,
    );

    ctx.fillStyle = faint;
    ctx.font = "400 22px ui-monospace, monospace";
    ctx.fillText("cadencce.vercel.app/daily", 80, 585);

    setDataUrl(canvas.toDataURL("image/png"));
  }, [result, day]);

  const summary = `Cadence Daily ${day}: ${Math.round(
    result.wpm,
  )} wpm, ${result.accuracy.toFixed(1)}% accuracy. cadencce.vercel.app/daily`;

  return (
    <div className="panel flex flex-col gap-4 p-5">
      <span className="mono-label">Share</span>
      <canvas
        ref={canvasRef}
        className="w-full rounded-[var(--radius)] border border-[var(--border)]"
        aria-label="Daily challenge result card"
      />
      <div className="flex flex-wrap items-center gap-3">
        {dataUrl && (
          <a
            href={dataUrl}
            download={`cadence-daily-${day}.png`}
            className="rounded-[var(--radius)] bg-[var(--primary)] px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--primary-ink)]"
          >
            Download image
          </a>
        )}
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(summary);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              // clipboard unavailable
            }
          }}
          className="rounded-[var(--radius)] border border-[var(--border-strong)] px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
        >
          {copied ? "copied" : "copy summary"}
        </button>
      </div>
    </div>
  );
}
