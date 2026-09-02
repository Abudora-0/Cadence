"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { KeyVoice } from "@/lib/audio/sound-engine";
import { CUSTOM_TEXT_MAX_CHARS } from "@/lib/typing/custom-text";
import {
  DEFAULT_MODE_CONFIG,
  type CodeLang,
  type Language,
  type Mode,
  type ModeConfig,
} from "@/lib/typing/types";

export type CaretStyle = "bar" | "block" | "underline" | "off";

interface SettingsState {
  config: ModeConfig;
  customText: string;
  voice: KeyVoice;
  volume: number;
  metronome: boolean;
  soundOnError: boolean;
  focusMode: boolean;
  liveGraph: boolean;
  ghost: boolean;
  caret: CaretStyle;
  smoothCaret: boolean;
  hydrated: boolean;

  setMode: (mode: Mode) => void;
  setCustomText: (text: string) => void;
  setTime: (sec: number) => void;
  setWordCount: (count: number) => void;
  setLanguage: (language: Language) => void;
  setCodeLang: (lang: CodeLang) => void;
  togglePunctuation: () => void;
  toggleNumbers: () => void;
  setVoice: (voice: KeyVoice) => void;
  setVolume: (v: number) => void;
  toggle: (
    key: "metronome" | "soundOnError" | "focusMode" | "liveGraph" | "ghost" | "smoothCaret",
  ) => void;
  setCaret: (caret: CaretStyle) => void;
  markHydrated: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      config: DEFAULT_MODE_CONFIG,
      customText: "",
      voice: "typewriter",
      volume: 0.5,
      metronome: false,
      soundOnError: true,
      focusMode: true,
      liveGraph: true,
      ghost: true,
      caret: "bar",
      smoothCaret: true,
      hydrated: false,

      setMode: (mode) => set((s) => ({ config: { ...s.config, mode } })),
      setCustomText: (text) =>
        set({ customText: text.slice(0, CUSTOM_TEXT_MAX_CHARS) }),
      setTime: (timeSec) => set((s) => ({ config: { ...s.config, timeSec } })),
      setWordCount: (wordCount) =>
        set((s) => ({ config: { ...s.config, wordCount } })),
      setLanguage: (language) =>
        set((s) => ({ config: { ...s.config, language } })),
      setCodeLang: (codeLang) =>
        set((s) => ({ config: { ...s.config, codeLang } })),
      togglePunctuation: () =>
        set((s) => ({
          config: { ...s.config, punctuation: !s.config.punctuation },
        })),
      toggleNumbers: () =>
        set((s) => ({ config: { ...s.config, numbers: !s.config.numbers } })),
      setVoice: (voice) => set({ voice }),
      setVolume: (volume) => set({ volume }),
      toggle: (key) => set((s) => ({ [key]: !s[key] }) as Partial<SettingsState>),
      setCaret: (caret) => set({ caret }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "cadence.settings",
      version: 2,
      migrate: (persisted) => persisted as SettingsState,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        config: s.config,
        customText: s.customText,
        voice: s.voice,
        volume: s.volume,
        metronome: s.metronome,
        soundOnError: s.soundOnError,
        focusMode: s.focusMode,
        liveGraph: s.liveGraph,
        ghost: s.ghost,
        caret: s.caret,
        smoothCaret: s.smoothCaret,
      }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);
