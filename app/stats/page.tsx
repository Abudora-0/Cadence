import type { Metadata } from "next";
import { StatsView } from "@/components/stats/stats-view";

export const metadata: Metadata = {
  title: "Stats",
  description:
    "Your Cadence history: personal bests, WPM progression, accuracy, and every recent run, stored locally in your browser.",
};

export default function StatsPage() {
  return <StatsView />;
}
