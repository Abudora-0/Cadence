export type FeatureMotif =
  | "waveform"
  | "tempo"
  | "ghost"
  | "graph"
  | "heatmap"
  | "themes"
  | "replay"
  | "local";

export interface Feature {
  title: string;
  body: string;
  motif: FeatureMotif;
}

/** Shared by the landing feature showcase and the About page. */
export const FEATURES: Feature[] = [
  {
    title: "Keystroke waveform",
    body: "Every key you press paints a bar on a scrolling waveform. The spacing between bars is the real time gap between your strokes, so you can literally see your rhythm.",
    motif: "waveform",
  },
  {
    title: "Tempo lock",
    body: "A metronome reads the median interval between your keys and pulses at that pace. Turn on the tick and try to hold the beat.",
    motif: "tempo",
  },
  {
    title: "Ghost race",
    body: "Your best run for the current mode becomes a ghost that races beside you in real time. Stay ahead of the mark to beat it.",
    motif: "ghost",
  },
  {
    title: "Live speed graph",
    body: "Words per minute, raw speed, and error spikes are plotted while you type and again in full on the results card.",
    motif: "graph",
  },
  {
    title: "Per key heatmap and drills",
    body: "Every run grades the keys you touched and tints a keyboard by accuracy. Your stats page keeps a lifetime version, and a weak-key drill builds runs out of real words that lean on the letters you miss.",
    motif: "heatmap",
  },
  {
    title: "Watch your run back",
    body: "Every run records the exact timing of every character. Replay any of them, scrub through, and see where the tempo broke.",
    motif: "replay",
  },
  {
    title: "Five instrument themes",
    body: "Midnight, Paper, Terminal, Synthwave and Nord. Each one remaps the entire surface, including the scrollbar, caret, selection, dropdowns and counters.",
    motif: "themes",
  },
  {
    title: "Local and private",
    body: "No account, no server. Settings live in local storage and your run history and progress live in IndexedDB on your device.",
    motif: "local",
  },
];
