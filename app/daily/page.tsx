import type { Metadata } from "next";
import { DailyChallenge } from "@/components/daily/daily-challenge";

export const metadata: Metadata = {
  title: "Daily challenge",
  description:
    "One 50 word typing challenge a day, the same text for everyone, seeded by the date. Track your attempts and share the result.",
};

export default function DailyPage() {
  return <DailyChallenge />;
}
