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
  {
    lang: "javascript",
    label: "once",
    code: `function once(fn) {
  let called = false;
  let value;
  return function (...args) {
    if (!called) {
      called = true;
      value = fn.apply(this, args);
    }
    return value;
  };
}`,
  },
  {
    lang: "javascript",
    label: "range",
    code: `const range = (start, end, step = 1) => {
  const out = [];
  for (let i = start; i < end; i += step) {
    out.push(i);
  }
  return out;
};`,
  },
  {
    lang: "javascript",
    label: "chunk",
    code: `function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}`,
  },
  {
    lang: "javascript",
    label: "retry",
    code: `async function retry(fn, times = 3) {
  let lastError;
  for (let i = 0; i < times; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}`,
  },
  {
    lang: "javascript",
    label: "pick",
    code: `function pick(source, keys) {
  const out = {};
  for (const key of keys) {
    if (key in source) {
      out[key] = source[key];
    }
  }
  return out;
}`,
  },
  {
    lang: "python",
    label: "is_prime",
    code: `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True`,
  },
  {
    lang: "python",
    label: "flatten",
    code: `def flatten(items):
    out = []
    for item in items:
        if isinstance(item, list):
            out.extend(flatten(item))
        else:
            out.append(item)
    return out`,
  },
  {
    lang: "python",
    label: "word_count",
    code: `def word_count(text):
    counts = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts`,
  },
  {
    lang: "python",
    label: "binary_search",
    code: `def binary_search(items, target):
    low, high = 0, len(items) - 1
    while low <= high:
        mid = (low + high) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
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
