import type { Metadata } from "next";
import { CadenceLogo } from "@/components/logo/cadence-logo";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Reveal } from "@/components/ui/reveal";
import { FEATURES } from "@/lib/content/features";
import { SHORTCUTS } from "@/lib/content/shortcuts";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Cadence is, why it treats typing as rhythm practice, the feature set, and the keyboard shortcuts.",
};

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
        {FEATURES.map((f, i) => (
          <Reveal
            key={f.title}
            delay={(i % 2) * 60}
            className="panel flex flex-col gap-2 p-5"
          >
            <h2 className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--primary)]">
              {f.title}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-dim)]">
              {f.body}
            </p>
          </Reveal>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <span className="mono-label">Keyboard shortcuts</span>
        <div className="panel divide-y divide-[var(--border)]">
          {SHORTCUTS.map((s, i) => (
            <Reveal
              key={s.keys}
              delay={i * 40}
              className="flex items-center justify-between gap-4 px-5 py-3"
            >
              <kbd className="rounded border border-[var(--border-strong)] px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-dim)]">
                {s.keys}
              </kbd>
              <span className="text-sm text-[var(--text-dim)]">{s.action}</span>
            </Reveal>
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
        <MagneticButton href="/practice" className="mt-2">
          Start a run
        </MagneticButton>
      </section>
    </div>
  );
}
