type Listener = (correct: boolean) => void;

const listeners = new Set<Listener>();

/** Fired by the landing mini typing strip on each keystroke. */
export function emitPulse(correct: boolean): void {
  for (const l of listeners) l(correct);
}

export function onPulse(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
