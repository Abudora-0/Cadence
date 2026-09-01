<div align="center">

<img src="https://raw.githubusercontent.com/Abudora-0/Cadence/main/public/icon.svg" alt="Cadence logo" width="88" height="88" />

# Cadence

**Type to a tempo. Tune out the rest.**

A focus first typing trainer that treats speed as a rhythm problem. Every keystroke
feeds a live waveform, a metronome locks to your pace, and a ghost of your best run
races alongside you.

<br />

[![Live demo](https://img.shields.io/badge/demo-cadencce.vercel.app-7cf7d0?style=flat-square&logo=vercel&logoColor=white)](https://cadencce.vercel.app)
[![CI](https://img.shields.io/github/actions/workflow/status/Abudora-0/Cadence/ci.yml?branch=main&style=flat-square&label=ci)](https://github.com/Abudora-0/Cadence/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-b8a6ff?style=flat-square)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-7cf7d0?style=flat-square)](https://github.com/Abudora-0/Cadence/pulls)

[Live demo](https://cadencce.vercel.app) &nbsp;/&nbsp; [Report a bug](https://github.com/Abudora-0/Cadence/issues) &nbsp;/&nbsp; [Request a feature](https://github.com/Abudora-0/Cadence/issues)

</div>

---

## Why Cadence

The fastest typists are not hammering keys, they are holding an even tempo and letting
the words land on the beat. Most typing tests only show you a number at the end.
Cadence shows you the rhythm while you type, so you can feel where you rush, where you
stall, and where you find the groove.

`Tags:` typing test, typing trainer, wpm, words per minute, keyboard practice,
rhythm, focus mode, monkeytype alternative, next.js, react, tailwind, web audio,
local first

## Features

| | |
|---|---|
| **Keystroke waveform** | Every key paints a bar on a scrolling waveform. The gap between bars is the real time gap between your strokes, so your rhythm is visible at a glance. |
| **Tempo lock** | A metronome reads the median interval between your keys and pulses at that pace, with an optional audible tick. |
| **Ghost race** | Your best run for the current mode becomes a ghost that moves through the text in real time. Stay ahead of the mark to beat it. |
| **Live speed graph** | Words per minute, raw speed, and error spikes plotted while you type and again in full on the results card. |
| **Per key heatmap** | The results card grades every key you touched and calls out your shakiest three. |
| **Five instrument themes** | Midnight, Paper, Terminal, Synthwave and Nord. Each one remaps the entire surface, including the scrollbar, caret, selection, dropdowns, sliders and counters. |
| **Synthesised sound** | Typewriter, mechanical, soft tape and marimba key voices, all generated with the Web Audio API. No audio files. |
| **Modes** | Time attack, word sprint, quote, code (JavaScript and Python), and an open ended Zen mode. |
| **Command bar** | `Cmd` / `Ctrl` + `K` for modes, themes, navigation and settings. |
| **Local first** | No account, no backend. Settings live in local storage and run history lives in IndexedDB on your device. |
| **Considered motion** | Animated logo, page transitions, odometer counters, and a full `prefers-reduced-motion` fallback. |
| **Works on touch** | Character input is routed through a hidden field, so on-screen keyboards work on phones and tablets. |

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Tab` | Restart the current run with fresh text |
| `Esc` | Reset back to the start |
| `Enter` | Finish a Zen run |
| `Cmd` / `Ctrl` + `K` | Open the command bar |

## Tech stack

- **Framework** Next.js 16 App Router, React 19, TypeScript
- **Styling** Tailwind CSS v4 with a token driven theme system
- **Animation** Motion
- **State** Zustand for settings, a small store over `idb-keyval` for history
- **Audio** Web Audio API, synthesised at runtime
- **Telemetry** Vercel Analytics and Speed Insights
- **Hosting** Vercel, zero configuration

## Getting started

Requires Node 20 or newer.

```bash
git clone https://github.com/Abudora-0/Cadence.git
cd Cadence
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

```bash
npm run dev         # start the dev server
npm run build       # production build
npm run start       # serve the production build
npm run lint        # eslint
npm run typecheck   # tsc, no emit
npm run test        # vitest, single run
npm run test:watch  # vitest, watch mode
npm run icons       # regenerate favicon, app icons and maskable icon
npm run social      # regenerate .github/social-preview.png
```

## Deployment

Cadence is a static client app and deploys to Vercel with no configuration.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Abudora-0/Cadence)

1. Push the repository to your Git provider.
2. Import it at [vercel.com/new](https://vercel.com/new). The Next.js preset is detected automatically.
3. Set `NEXT_PUBLIC_SITE_URL` to your final domain (Project Settings, Environment Variables) so metadata and the Open Graph image use the right origin.
4. Enable Analytics and Speed Insights for the project in the Vercel dashboard.
5. Upload `.github/social-preview.png` under Settings, General, Social preview on GitHub.

## Project structure

```
app/                 routes plus robots, sitemap, manifest, icons,
                     opengraph image, and error boundaries
components/
  chrome/            header, command bar, theme switcher, settings drawer
  logo/              the animated Cadence mark
  typing/            engine driven UI: word stream, HUD, waveform, results
  ui/                themed primitives: select, slider, segmented, counter
lib/
  audio/             Web Audio sound engine
  store/             settings, history and theme stores
  typing/            the typing engine, word pools, quotes, code, stats,
                     and the *.test.ts suites
scripts/             one off generators for the icons and social card
```

## Tests

The typing engine and the stats math are covered by Vitest.

```bash
npm run test
```

`stats.test.ts` covers the WPM, accuracy, consistency and tempo formulas.
`words.test.ts` and `content.test.ts` cover deterministic text generation.
`use-typing-engine.test.tsx` drives the hook through real runs: character
matching, word commit and skip, backspace rules, run completion, progress,
restart, and both the keydown and composed-input paths.

## Contributing

Issues and pull requests are welcome. CI runs lint, typecheck, tests and a
build on every push and pull request; run `npm run test` locally before
opening a PR.

## License

[MIT](./LICENSE)
