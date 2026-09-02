"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CadenceLogo } from "@/components/logo/cadence-logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 text-center">
      <CadenceLogo size={56} animated={false} />
      <h1
        className="text-2xl font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        The rhythm dropped a beat.
      </h1>
      <p className="text-sm text-[var(--text-dim)]">
        Something went wrong while rendering this page. Your run history is safe on
        this device.
      </p>
      {error.digest && (
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-faint)]">
          ref {error.digest}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-[var(--radius)] bg-[var(--primary)] px-5 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--primary-ink)] transition-transform hover:-translate-y-0.5"
        >
          Try again
        </button>
        <Link
          href="/practice"
          className="rounded-[var(--radius)] border border-[var(--border-strong)] px-5 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
        >
          Back to practice
        </Link>
      </div>
    </div>
  );
}
