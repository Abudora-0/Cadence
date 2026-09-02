"use client";

import { motion } from "motion/react";
import { FEATURES } from "@/lib/content/features";
import { Reveal } from "@/components/ui/reveal";
import { cardHover } from "@/components/ui/motion-presets";
import { FeatureMotifView } from "./feature-motif";

export function FeatureShowcase() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
      <Reveal className="flex flex-col gap-3">
        <span className="mono-label">What is under the hood</span>
        <h2
          className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Instruments, not gimmicks.
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--text-dim)]">
          Every part of Cadence is there to show you something real about how you
          type, then get out of the way.
        </p>
      </Reveal>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal
            key={f.title}
            as="li"
            delay={(i % 3) * 70}
            className="h-full"
          >
            <motion.div
              {...cardHover}
              className="panel flex h-full flex-col gap-4 p-5"
            >
              <FeatureMotifView motif={f.motif} />
              <div className="flex flex-col gap-2">
                <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--primary)]">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-dim)]">
                  {f.body}
                </p>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
