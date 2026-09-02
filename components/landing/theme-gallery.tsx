"use client";

import { motion } from "motion/react";
import { THEMES } from "@/lib/themes";
import { setTheme, useTheme } from "@/lib/store/theme-store";
import { Reveal } from "@/components/ui/reveal";

export function ThemeGallery() {
  const active = useTheme();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
      <Reveal className="flex flex-col gap-3">
        <span className="mono-label">Five instruments</span>
        <h2
          className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Pick a room to practice in.
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--text-dim)]">
          Each theme remaps the whole surface, down to the scrollbar and the
          caret. Tap one to try it on right now.
        </p>
      </Reveal>

      <Reveal className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {THEMES.map((theme) => {
          const [bg, primary, accent] = theme.swatch;
          const text = theme.dark ? "#f4f4f6" : "#1a1813";
          const faint = theme.dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)";
          const isActive = theme.id === active;
          return (
            <motion.button
              key={theme.id}
              type="button"
              onClick={() => setTheme(theme.id)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border text-left transition-colors"
              style={{
                borderColor: isActive ? primary : "var(--border)",
                boxShadow: isActive ? `0 0 24px ${primary}55` : "none",
              }}
              aria-pressed={isActive}
            >
              <div
                className="flex flex-col gap-2 p-3"
                style={{ background: bg, color: text }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: primary }}
                  />
                  <span
                    className="h-1.5 w-8 rounded-full"
                    style={{ background: faint }}
                  />
                </div>
                <div className="flex flex-col gap-1 text-[0.6rem] leading-relaxed">
                  <span>
                    <span style={{ color: text }}>the quiet metro</span>
                    <span style={{ color: faint }}>nome keeps time</span>
                  </span>
                  <span style={{ color: faint }}>and the words fall</span>
                </div>
                <div className="flex items-end gap-[2px]">
                  {[8, 14, 20, 12, 16, 9, 18].map((h, i) => (
                    <span
                      key={i}
                      className="w-[3px] rounded-full"
                      style={{
                        height: h,
                        background: i % 2 ? accent : primary,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text)]">
                  {theme.label}
                </span>
                <span className="font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[var(--text-faint)]">
                  {isActive ? "on" : "try"}
                </span>
              </div>
            </motion.button>
          );
        })}
      </Reveal>
    </section>
  );
}
