export type ThemeId = "midnight" | "paper" | "terminal" | "synthwave" | "nord";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  blurb: string;
  dark: boolean;
  /* swatch: [background, primary, accent] for the picker preview */
  swatch: [string, string, string];
}

export const THEMES: ThemeMeta[] = [
  {
    id: "midnight",
    label: "Midnight",
    blurb: "Deep space, mint signal",
    dark: true,
    swatch: ["#07070a", "#7cf7d0", "#b8a6ff"],
  },
  {
    id: "paper",
    label: "Paper",
    blurb: "Warm daylight, ink on stock",
    dark: false,
    swatch: ["#f6f4ef", "#0f7d63", "#6d51d6"],
  },
  {
    id: "terminal",
    label: "Terminal",
    blurb: "Phosphor green, CRT scanlines",
    dark: true,
    swatch: ["#030a05", "#4af68d", "#8affb0"],
  },
  {
    id: "synthwave",
    label: "Synthwave",
    blurb: "Neon dusk, magenta and cyan",
    dark: true,
    swatch: ["#120821", "#ff5cd1", "#7cf0ff"],
  },
  {
    id: "nord",
    label: "Nord",
    blurb: "Cold slate, frost accent",
    dark: true,
    swatch: ["#242933", "#88c0d0", "#b48ead"],
  },
];

export const DEFAULT_THEME: ThemeId = "midnight";
export const THEME_STORAGE_KEY = "cadence.theme";

export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === "string" && THEMES.some((theme) => theme.id === value)
  );
}
