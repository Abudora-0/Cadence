import Link from "next/link";
import { CadenceLogo } from "@/components/logo/cadence-logo";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 text-center">
      <CadenceLogo size={56} />
      <h1
        className="text-2xl font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        This bar of music is empty.
      </h1>
      <p className="text-sm text-[var(--text-dim)]">
        The page you were looking for is not here. Head back and start a run.
      </p>
      <Link
        href="/practice"
        className="rounded-[var(--radius)] bg-[var(--primary)] px-5 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--primary-ink)]"
      >
        Back to practice
      </Link>
    </div>
  );
}
