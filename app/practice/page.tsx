import type { Metadata } from "next";
import Link from "next/link";
import { TypingTest } from "@/components/typing/typing-test";
import { CadenceLogo } from "@/components/logo/cadence-logo";

export const metadata: Metadata = {
  title: "Practice",
  description:
    "Run a typing session in Cadence. Pick a mode, tune out the rest, and watch your rhythm take shape.",
};

export default function PracticePage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <CadenceLogo size={26} />
          <span className="mono-label">Session 001 / find your rhythm</span>
        </div>
        <h1
          className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Type to a tempo. Tune out the rest.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--text-dim)]">
          Cadence turns a typing test into a rhythm practice. Every keystroke feeds
          a live waveform, a metronome locks to your pace, and a ghost of your best
          run races alongside you.
        </p>
        <Link
          href="/daily"
          className="group flex w-fit items-center gap-2 rounded-[var(--radius)] border border-[var(--border-strong)] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-dim)] transition-colors hover:border-[var(--primary)] hover:text-[var(--text)]"
        >
          <span className="text-[var(--primary)]">&#9670;</span>
          Today&apos;s daily challenge
          <span className="transition-transform group-hover:translate-x-0.5">
            &rarr;
          </span>
        </Link>
      </header>

      <TypingTest />
    </div>
  );
}
