"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  isThemeId,
  type ThemeId,
} from "@/lib/themes";

const listeners = new Set<() => void>();

function currentTheme(): ThemeId {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const attr = document.documentElement.dataset.theme;
  return isThemeId(attr) ? attr : DEFAULT_THEME;
}

let snapshot: ThemeId = DEFAULT_THEME;

function emit() {
  snapshot = currentTheme();
  for (const l of listeners) l();
}

export function setTheme(id: ThemeId): void {
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // storage unavailable, keep the in-memory value
  }
  emit();
}

export function cycleTheme(order: ThemeId[]): void {
  const idx = order.indexOf(currentTheme());
  setTheme(order[(idx + 1) % order.length]);
}

export function useTheme(): ThemeId {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot,
    () => DEFAULT_THEME,
  );
}

export function syncThemeSnapshot(): void {
  snapshot = currentTheme();
}

/** Applies the theme saved on this device. Called once on mount. */
export function applyStoredTheme(): void {
  if (typeof document === "undefined") return;
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    stored = null;
  }
  const next = isThemeId(stored) ? stored : DEFAULT_THEME;
  if (document.documentElement.dataset.theme !== next) {
    document.documentElement.dataset.theme = next;
  }
  snapshot = next;
  for (const l of listeners) l();
}
