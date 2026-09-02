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
  {
    text: "Amateurs practice until they get it right. Professionals practice until they cannot get it wrong.",
    source: "adapted",
    length: "short",
  },
  {
    text: "Speed is a byproduct of ridiculous, sustained focus on one small thing at a time.",
    source: "adapted",
    length: "short",
  },
  {
    text: "You do not rise to the level of your goals, you fall to the level of your systems and your daily reps.",
    source: "adapted",
    length: "short",
  },
  {
    text: "The margin between a good typist and a fast one is not effort, it is calm. Panic adds errors, and errors cost more time than care ever did.",
    source: "Cadence",
    length: "medium",
  },
  {
    text: "Attention is the rarest and purest form of generosity. Give it to one line at a time and the paragraph takes care of itself.",
    source: "adapted",
    length: "medium",
  },
  {
    text: "It is not that I am so smart, it is that I stay with problems longer. Stay with the awkward key until it stops being awkward.",
    source: "adapted",
    length: "medium",
  },
  {
    text: "The person who chases two rabbits catches neither. Chase accuracy first and let the speed follow it home.",
    source: "adapted",
    length: "medium",
  },
  {
    text: "Do not confuse motion with progress. A hundred sloppy words teach your hands less than twenty clean ones typed with full attention to the beat.",
    source: "Cadence",
    length: "medium",
  },
  {
    text: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
    source: "adapted",
    length: "short",
  },
  {
    text: "Between stimulus and response there is a space. In that space is your power to choose the next key instead of lunging for it.",
    source: "adapted",
    length: "medium",
  },
  {
    text: "Music is the space between the notes, and typing is the space between the keys. Even that gap, held steady, and the rest becomes easy.",
    source: "Cadence",
    length: "medium",
  },
  {
    text: "The secret of getting ahead is getting started, and the secret of getting started is breaking your complex overwhelming tasks into small manageable ones, then starting on the first.",
    source: "adapted",
    length: "long",
  },
  {
    text: "We cannot solve our problems with the same thinking we used when we created them. If your fingers keep stumbling on the same words, slow the tempo and let a new pattern form before you speed it back up.",
    source: "adapted",
    length: "long",
  },
  {
    text: "There are years that ask questions and years that answer. There are also runs that ask questions and runs that answer, and you will not know which is which until you finish and read the graph.",
    source: "adapted",
    length: "long",
  },
  {
    text: "Nothing in the world is worth having or worth doing unless it means effort, pain, and difficulty. The blister on the little finger fades, but the muscle that learned the reach stays.",
    source: "adapted",
    length: "long",
  },
  {
    text: "Discipline is choosing between what you want now and what you want most. Right now you want to rush. What you want most is to type without thinking about it at all.",
    source: "adapted",
    length: "medium",
  },
  {
    text: "The best time to plant a tree was twenty years ago. The second best time is now. The same is true of the ten minutes of practice you keep meaning to do.",
    source: "adapted",
    length: "medium",
  },
  {
    text: "A goal without a system is a wish. Pick a mode, set a time, and show up for it the way you would show up for a friend.",
    source: "Cadence",
    length: "short",
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
