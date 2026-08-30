"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSettings } from "@/lib/store/settings-store";
import { KEY_VOICES } from "@/lib/audio/sound-engine";
import { playKey, setMasterVolume } from "@/lib/audio/sound-engine";
import { ThemedSelect } from "@/components/ui/themed-select";
import { TickSlider } from "@/components/ui/tick-slider";
import { TogglePill } from "@/components/ui/toggle-pill";
import { Segmented } from "@/components/ui/segmented";
import type { CaretStyle } from "@/lib/store/settings-store";
import type { KeyVoice } from "@/lib/audio/sound-engine";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-4">
      <span className="mono-label">{label}</span>
      {children}
    </div>
  );
}

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const s = useSettings();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col gap-6 overflow-y-auto border-l border-[var(--border-strong)] bg-[var(--surface)] p-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm uppercase tracking-[0.24em] text-[var(--text-dim)]">
                Tuning
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[var(--radius)] border border-[var(--border)] px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--text-faint)] hover:text-[var(--text)]"
              >
                esc
              </button>
            </div>

            <Row label="Keystroke voice">
              <ThemedSelect<KeyVoice>
                ariaLabel="Keystroke voice"
                options={KEY_VOICES.map((v) => ({ value: v.id, label: v.label }))}
                value={s.voice}
                onChange={(v) => {
                  s.setVoice(v);
                  playKey(v);
                }}
              />
            </Row>

            <Row label="Volume">
              <TickSlider
                ariaLabel="Volume"
                min={0}
                max={100}
                step={5}
                value={Math.round(s.volume * 100)}
                onChange={(v) => {
                  s.setVolume(v / 100);
                  setMasterVolume(v / 100);
                }}
                format={(v) => `${v}%`}
              />
            </Row>

            <Row label="Caret">
              <Segmented<CaretStyle>
                ariaLabel="Caret style"
                size="sm"
                options={[
                  { value: "bar", label: "Bar" },
                  { value: "block", label: "Block" },
                  { value: "underline", label: "Line" },
                  { value: "off", label: "Off" },
                ]}
                value={s.caret}
                onChange={s.setCaret}
              />
            </Row>

            <Row label="Behaviour">
              <div className="flex flex-wrap gap-2">
                <TogglePill label="Metronome" active={s.metronome} onChange={() => s.toggle("metronome")} />
                <TogglePill label="Error sound" active={s.soundOnError} onChange={() => s.toggle("soundOnError")} />
                <TogglePill label="Focus dim" active={s.focusMode} onChange={() => s.toggle("focusMode")} />
                <TogglePill label="Live graph" active={s.liveGraph} onChange={() => s.toggle("liveGraph")} />
                <TogglePill label="Ghost race" active={s.ghost} onChange={() => s.toggle("ghost")} />
                <TogglePill label="Smooth caret" active={s.smoothCaret} onChange={() => s.toggle("smoothCaret")} />
              </div>
            </Row>

            <p className="mt-auto font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.14em] text-[var(--text-faint)]">
              Tab restarts a run. Esc resets. Cmd or Ctrl + K opens the command bar.
              Everything here is stored on this device only.
            </p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
