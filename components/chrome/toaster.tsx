"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { dismissToast, useToasts, type Toast } from "@/lib/store/toast-store";

const TTL = 5200;

export function Toaster() {
  const toasts = useToasts();

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-[min(20rem,calc(100vw-2.5rem))] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast }: { toast: Toast }) {
  useEffect(() => {
    const id = window.setTimeout(() => dismissToast(toast.id), TTL);
    return () => window.clearTimeout(id);
  }, [toast.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      onClick={() => dismissToast(toast.id)}
      className="pointer-events-auto cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border border-[var(--primary)] bg-[var(--surface-2)] p-4 shadow-[var(--shadow)] backdrop-blur"
    >
      <div className="flex items-start gap-3">
        {toast.kind === "achievement" && (
          <motion.span
            initial={{ scale: 0.4, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 16, delay: 0.05 }}
            className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-ink)]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M6 1l1.6 3.3L11 4.8 8.5 7.3 9 11 6 9.2 3 11l.5-3.7L1 4.8l3.4-.5z"
                fill="currentColor"
              />
            </svg>
          </motion.span>
        )}
        <div className="flex flex-col gap-0.5">
          {toast.kind === "achievement" && (
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[var(--primary)]">
              Achievement
            </span>
          )}
          <span className="text-sm font-semibold text-[var(--text)]">
            {toast.title}
          </span>
          {toast.body && (
            <span className="text-[0.78rem] leading-relaxed text-[var(--text-dim)]">
              {toast.body}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
