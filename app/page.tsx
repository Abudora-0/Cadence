import type { Metadata } from "next";
import { LandingHero } from "@/components/landing/landing-hero";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { ThemeGallery } from "@/components/landing/theme-gallery";
import { SocialProof } from "@/components/landing/social-proof";
import { LandingCta } from "@/components/landing/landing-cta";

export const metadata: Metadata = {
  description:
    "Cadence is a focus first typing trainer. A live keystroke waveform, a tempo lock metronome, a ghost race against your past self, run replays and a daily challenge. No account, all on your device.",
  openGraph: {
    title: "Cadence - find your typing rhythm",
    description:
      "A focus first typing trainer that treats speed as rhythm. Live waveform, metronome, ghost race, replays and a daily challenge.",
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-[var(--section-gap)] pb-24">
      <LandingHero />
      <FeatureShowcase />
      <ThemeGallery />
      <SocialProof />
      <LandingCta />
    </div>
  );
}
