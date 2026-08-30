"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { useSettings } from "@/lib/store/settings-store";
import { setMasterVolume } from "@/lib/audio/sound-engine";
import { applyStoredTheme } from "@/lib/store/theme-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const volume = useSettings((s) => s.volume);
  const hydrated = useSettings((s) => s.hydrated);

  useEffect(() => {
    applyStoredTheme();
  }, []);

  useEffect(() => {
    if (hydrated) setMasterVolume(volume);
  }, [volume, hydrated]);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.35 }}>
      {children}
    </MotionConfig>
  );
}
