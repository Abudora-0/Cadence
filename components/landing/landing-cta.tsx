import { CadenceLogo } from "@/components/logo/cadence-logo";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Reveal } from "@/components/ui/reveal";

export function LandingCta() {
  return (
    <section className="relative overflow-hidden border-y border-[var(--border)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div className="tick-row absolute inset-x-0 top-0 h-3 opacity-40" aria-hidden />
      <div
        className="tick-row absolute inset-x-0 bottom-0 h-3 opacity-40"
        aria-hidden
      />

      <Reveal className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-8">
        <CadenceLogo size={48} />
        <h2
          className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Find your tempo.
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-[var(--text-dim)]">
          One page, no account, open source. Start a run and let the noise of the
          day fade behind you.
        </p>
        <MagneticButton href="/practice">Open the typing test</MagneticButton>
      </Reveal>
    </section>
  );
}
