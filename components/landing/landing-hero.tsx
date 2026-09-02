import type { CSSProperties } from "react";
import { CadenceLogo } from "@/components/logo/cadence-logo";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { HeroOscilloscope } from "./hero-oscilloscope";
import { MiniTypingStrip } from "./mini-typing-strip";

const LINE_1 = ["Type", "to", "a", "tempo."];
const LINE_2 = ["Tune", "out", "the", "rest."];

const riseDelay = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

function Word({ w, delay }: { w: string; delay: number }) {
  return (
    <span className="rise-in inline-block" style={riseDelay(delay)}>
      {w}&nbsp;
    </span>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <HeroOscilloscope height={220} />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28">
        <div className="rise-in flex items-center gap-3" style={riseDelay(0)}>
          <CadenceLogo size={34} withWordmark />
          <span className="mono-label">Focus first typing trainer</span>
        </div>

        <h1
          className="max-w-3xl text-[clamp(2.6rem,7vw,4.75rem)] font-semibold leading-[1.05] tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="block">
            {LINE_1.map((w, i) => (
              <Word key={w} w={w} delay={120 + i * 70} />
            ))}
          </span>
          <span className="block text-[var(--text-dim)]">
            {LINE_2.map((w, i) => (
              <Word key={w} w={w} delay={120 + (LINE_1.length + i) * 70} />
            ))}
          </span>
        </h1>

        <p
          className="rise-in max-w-xl text-base leading-relaxed text-[var(--text-dim)]"
          style={riseDelay(640)}
        >
          Cadence turns a typing test into rhythm practice. A live keystroke
          waveform, a metronome that locks to your pace, and a ghost of your best
          run racing alongside you. No account, all on your device.
        </p>

        <div className="rise-in flex flex-col gap-6" style={riseDelay(760)}>
          <MiniTypingStrip />
          <div className="flex flex-wrap items-center gap-3">
            <MagneticButton href="/practice">Start typing</MagneticButton>
            <MagneticButton href="/daily" variant="outline">
              Daily challenge
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
