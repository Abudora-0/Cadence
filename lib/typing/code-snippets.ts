import type { CodeLang } from "./types";

export interface CodeSnippet {
  lang: CodeLang;
  label: string;
  code: string;
}

export const CODE_SNIPPETS: CodeSnippet[] = [
  {
    lang: "javascript",
    label: "debounce",
    code: `function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}`,
  },
  {
    lang: "javascript",
    label: "clamp",
    code: `const clamp = (value, min, max) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};`,
  },
  {
    lang: "javascript",
    label: "groupBy",
    code: `function groupBy(items, keyFn) {
  const out = new Map();
  for (const item of items) {
    const key = keyFn(item);
    const bucket = out.get(key) ?? [];
    bucket.push(item);
    out.set(key, bucket);
  }
  return out;
}`,
  },
  {
    lang: "python",
    label: "fibonacci",
    code: `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
  },
  {
    lang: "python",
    label: "moving_average",
    code: `def moving_average(values, window):
    result = []
    total = 0.0
    for i, value in enumerate(values):
        total += value
        if i >= window:
            total -= values[i - window]
        result.append(total / min(i + 1, window))
    return result`,
  },
];

export function pickCodeSnippet(lang: CodeLang, seed?: number): CodeSnippet {
  const pool = CODE_SNIPPETS.filter((snippet) => snippet.lang === lang);
  const list = pool.length ? pool : CODE_SNIPPETS;
  const idx =
    seed === undefined
      ? Math.floor(Math.random() * list.length)
      : seed % list.length;
  return list[idx];
}
