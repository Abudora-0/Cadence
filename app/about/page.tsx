import type { Metadata } from "next";
import Link from "next/link";
import { CadenceLogo } from "@/components/logo/cadence-logo";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Cadence is, why it treats typing as rhythm practice, the feature set, and the keyboard shortcuts.",
};

const FEATURES = [
  {
    title: "Keystroke waveform",
    body: "Every key you press paints a bar on a scrolling waveform. The spacing between bars is the real time gap between your strokes, so you can literally see your rhythm.",
  },
  {
    title: "Tempo lock",
    body: "A metronome reads the median interval between your keys and pulses at that pace. Turn on the tick and try to hold the beat.",
  },
  {
    title: "Ghost race",
    body: "Your best run for the current mode becomes a ghost that races beside you in real time. Stay ahead of the mark to beat it.",
  },
  {
    title: "Live speed graph",
    body: "Words per minute, raw speed, and error spikes are plotted while you type and again in full on the results card.",
  },
  {
    title: "Five instrument themes",
    body: "Midnight, Paper, Terminal, Synthwave and Nord. Each one remaps the entire surface, including the scrollbar, caret, selection, dropdowns and counters.",
  },
  {
    title: "Local and private",
    body: "No account, no server. Settings live in local storage and run history lives in IndexedDB on your device.",
  },
];

const SHORTCUTS = [
  ["Tab", "Restart the current run"],
  ["Esc", "Reset back to the start"],
  ["Enter", "Finish a Zen run"],
  ["Cmd / Ctrl + K", "Open the command bar"],
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-14">
      <header className="flex flex-col gap-6">
        <CadenceLogo size={64} />
        <h1
          className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          A typing trainer that thinks in beats, not just words per minute.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--text-dim)]">
          Speed on a keyboard is a rhythm problem. The fastest typists are not
          hammering keys, they are keeping an even tempo and letting the words
          fall on the beat. Cadence is built around that idea. It gives you a
          waveform, a metronome and a ghost of your past self, then gets out of
          the way so you can type.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="panel flex flex-col gap-2 p-5">
            <h2 className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--primary)]">
              {f.title}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-dim)]">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <span className="mono-label">Keyboard shortcuts</span>
        <div className="panel divide-y divide-[var(--border)]">
          {SHORTCUTS.map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between gap-4 px-5 py-3">
              <kbd className="rounded border border-[var(--border-strong)] px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-dim)]">
                {key}
              </kbd>
              <span className="text-sm text-[var(--text-dim)]">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <span className="mono-label">Built with</span>
        <p className="text-sm leading-relaxed text-[var(--text-dim)]">
          Next.js App Router, React, TypeScript, Tailwind CSS and Motion. Sound is
          synthesised in the browser with the Web Audio API, so there are no audio
          files to download. The whole thing is a static client app and deploys to
          Vercel with zero configuration.
        </p>
        <Link
          href="/"
          className="mt-2 w-fit rounded-[var(--radius)] bg-[var(--primary)] px-5 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--primary-ink)] transition-transform hover:-translate-y-0.5"
        >
          Start a run
        </Link>
      </section>
    </div>
  );
}
