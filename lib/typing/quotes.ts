export interface Quote {
  text: string;
  source: string;
  length: "short" | "medium" | "long";
}

export const QUOTES: Quote[] = [
  {
    text: "The keyboard is a rhythm instrument. Every accurate stroke is a note landed on the beat.",
    source: "Cadence",
    length: "short",
  },
  {
    text: "Simplicity is the ultimate sophistication, and it takes a long time to arrive there without losing the melody.",
    source: "adapted",
    length: "short",
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act but a habit worn smooth by practice.",
    source: "Aristotle, adapted",
    length: "medium",
  },
  {
    text: "The only way to go fast is to go well. Slow down, feel the interval between keys, and the speed follows on its own.",
    source: "Cadence",
    length: "medium",
  },
  {
    text: "A person who never made a mistake never tried anything new, and never learned the shape of their own hands on the home row.",
    source: "adapted",
    length: "medium",
  },
  {
    text: "Focus is a matter of deciding what things you are not going to do. Close the tabs, quiet the room, and let the words arrive one after another until the paragraph is finished and the noise of the day has faded somewhere behind you.",
    source: "adapted",
    length: "long",
  },
  {
    text: "The future is already here, it is just not evenly distributed. The same is true of fluency: your fingers already know most of these letters, they just have not yet agreed on the tempo.",
    source: "adapted",
    length: "long",
  },
];

export function pickQuote(lengthPref?: Quote["length"], seed?: number): Quote {
  const pool = lengthPref
    ? QUOTES.filter((q) => q.length === lengthPref)
    : QUOTES;
  const list = pool.length ? pool : QUOTES;
  const idx =
    seed === undefined
      ? Math.floor(Math.random() * list.length)
      : seed % list.length;
  return list[idx];
}
