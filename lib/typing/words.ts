import type { Language, ModeConfig } from "./types";

/**
 * Curated word pools. "english" is a tight set of the most common words for
 * fast, musical runs. "english-1k" widens the vocabulary for a tougher session.
 */

const ENGLISH_200 = `the of and a to in is you that it he was for on are as with his they at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part over new sound take only little work know place year live me back give most very after thing our just name good sentence man think say great where help through much before line right too mean old any same tell boy follow came want show also around form three small set put end does another well large must big even such because turn here why ask went men read need land different home us move try kind hand picture again change off play spell air away animal house point page letter mother answer found study still learn should world`
  .split(/\s+/)
  .filter(Boolean);

const ENGLISH_1K_EXTRA = `above add afraid against ago agree allow almost along already although always among amount ancient anger angle angry appear apple arm army arrive art article attack aunt autumn baby balance ball band bank bar base basket bath bear beat beauty become bed beer behind bell below beside best better between beyond bird birth bit bite black blade blood blow blue board boat body bone book border born borrow both bottle bottom bowl box branch brave bread break breakfast breath bridge bright bring broad broken brother brown brush build bunch burn bury bus business busy butter button buy cake camera camp can capital captain card care careful careless carry case castle cat catch cause ceiling cell center central century certain chain chair chance character charge chase cheap check cheese chest chicken chief child choice choose church circle city class clay clean clear clever climb clock close cloth cloud coast coat coffee coin cold collect college colour comfort common company compare complete condition connect consider contain continue control cook cool copper copy corn corner correct cost count country course court cousin cover cow crash cross crowd cry cup cupboard cut damage dance danger dark daughter dead deal dear death deep deer defeat degree delight depend desert desire desk destroy develop die difficult dig dinner direction dirty distance ditch divide doctor dog dollar door double doubt down dozen drop drive drum dry duck dust duty eager ear early earn earth east easy eat edge effort egg eight either electric elephant empty enemy engine enjoy enough enter equal escape especially evening event ever every example excellent except exchange excited exercise expect expensive experience explain express extra`
  .split(/\s+/)
  .filter(Boolean);

const PUNCTUATION_WRAPS: Array<(w: string) => string> = [
  (w) => `${w},`,
  (w) => `${w}.`,
  (w) => `"${w}"`,
  (w) => `(${w})`,
  (w) => `${w};`,
  (w) => `${w}:`,
  (w) => `${w}!`,
  (w) => `${w}?`,
  (w) => `'${w}'`,
  (w) => `${w}-`,
];

function pool(language: Language): string[] {
  return language === "english-1k"
    ? [...ENGLISH_200, ...ENGLISH_1K_EXTRA]
    : ENGLISH_200;
}

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededFrom(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Build a word list for a run. When a seed is supplied the output is
 * deterministic, which lets a ghost replay run on the exact same text.
 */
export function buildWords(config: ModeConfig, count: number, seed?: number): string[] {
  const words = pool(config.language);
  const rand = seed === undefined ? Math.random : mulberry32(seed);
  const out: string[] = [];
  let lastCapital = false;

  for (let i = 0; i < count; i += 1) {
    let w = words[Math.floor(rand() * words.length)];

    if (config.numbers && rand() < 0.12) {
      w = String(Math.floor(rand() * 9999));
    } else if (config.punctuation) {
      if (rand() < 0.16) {
        w = PUNCTUATION_WRAPS[Math.floor(rand() * PUNCTUATION_WRAPS.length)](w);
      }
      if (rand() < 0.14 || lastCapital) {
        w = w.charAt(0).toUpperCase() + w.slice(1);
        lastCapital = /[.!?]$/.test(w);
      }
    }

    out.push(w);
  }

  return out;
}

export function estimateWordCount(config: ModeConfig): number {
  if (config.mode === "words") return config.wordCount;
  if (config.mode === "time") return Math.ceil((config.timeSec / 60) * 140) + 40;
  return 60;
}
