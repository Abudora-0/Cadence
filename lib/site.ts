/** Canonical origin for metadata, sitemap, robots and the manifest. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cadencce.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Cadence";

export const SITE_DESCRIPTION =
  "A focus first typing trainer that treats speed as rhythm: a live keystroke waveform, a tempo lock metronome, and a ghost race against your past self.";
