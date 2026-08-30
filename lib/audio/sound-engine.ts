/**
 * A tiny synthesis engine. No audio files: every click, thock and metronome
 * tick is generated with oscillators and noise bursts so the whole thing stays
 * a few kilobytes and matches whatever theme is active.
 */

export type KeyVoice = "off" | "typewriter" | "mechanical" | "soft" | "pop";

export const KEY_VOICES: Array<{ id: KeyVoice; label: string }> = [
  { id: "off", label: "Silent" },
  { id: "typewriter", label: "Typewriter" },
  { id: "mechanical", label: "Mechanical" },
  { id: "soft", label: "Soft tape" },
  { id: "pop", label: "Marimba" },
];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);

    const len = Math.floor(ctx.sampleRate * 0.2);
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio(): void {
  ensureContext();
}

export function setMasterVolume(value: number): void {
  const c = ensureContext();
  if (c && master) master.gain.setTargetAtTime(value, c.currentTime, 0.02);
}

function noiseBurst(
  c: AudioContext,
  dest: AudioNode,
  duration: number,
  gain: number,
  filterFreq: number,
  filterType: BiquadFilterType = "bandpass",
): void {
  if (!noiseBuffer) return;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = c.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;
  filter.Q.value = 0.8;
  const g = c.createGain();
  const now = c.currentTime;
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  src.connect(filter).connect(g).connect(dest);
  src.start(now);
  src.stop(now + duration);
}

function tone(
  c: AudioContext,
  dest: AudioNode,
  freq: number,
  duration: number,
  gain: number,
  type: OscillatorType = "sine",
): void {
  const osc = c.createOscillator();
  const g = c.createGain();
  const now = c.currentTime;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(g).connect(dest);
  osc.start(now);
  osc.stop(now + duration);
}

const MARIMBA_SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

export function playKey(voice: KeyVoice, opts: { error?: boolean } = {}): void {
  if (voice === "off") return;
  const c = ensureContext();
  if (!c || !master) return;

  if (opts.error) {
    tone(c, master, 140, 0.12, 0.16, "square");
    noiseBurst(c, master, 0.08, 0.12, 500, "lowpass");
    return;
  }

  switch (voice) {
    case "typewriter":
      noiseBurst(c, master, 0.035, 0.28, 2600);
      tone(c, master, 180, 0.04, 0.1, "triangle");
      break;
    case "mechanical":
      noiseBurst(c, master, 0.028, 0.22, 4200, "highpass");
      tone(c, master, 320, 0.03, 0.06, "square");
      break;
    case "soft":
      noiseBurst(c, master, 0.05, 0.12, 900, "lowpass");
      break;
    case "pop": {
      const note =
        MARIMBA_SCALE[Math.floor(Math.random() * MARIMBA_SCALE.length)];
      tone(c, master, note, 0.18, 0.12, "sine");
      tone(c, master, note * 2, 0.08, 0.04, "sine");
      break;
    }
    default:
      break;
  }
}

export function playMetronome(accent = false): void {
  const c = ensureContext();
  if (!c || !master) return;
  tone(c, master, accent ? 1600 : 1100, 0.04, accent ? 0.14 : 0.08, "sine");
}

export function playFanfare(): void {
  const c = ensureContext();
  if (!c || !master) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, i) => {
    window.setTimeout(() => tone(c, master as GainNode, n, 0.4, 0.12, "triangle"), i * 90);
  });
}
