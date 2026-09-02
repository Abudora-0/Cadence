"use client";

import { useSyncExternalStore } from "react";

export interface Toast {
  id: string;
  title: string;
  body?: string;
  kind: "achievement" | "info";
}

let toasts: Toast[] = [];
const listeners = new Set<() => void>();

function emit() {
  toasts = [...toasts];
  for (const l of listeners) l();
}

const MAX_VISIBLE = 4;

export function pushToast(t: Omit<Toast, "id">): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  toasts = [...toasts, { ...t, id }].slice(-MAX_VISIBLE);
  for (const l of listeners) l();
  return id;
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => toasts,
    () => toasts,
  );
}
