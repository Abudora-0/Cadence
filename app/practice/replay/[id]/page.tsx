"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useHistory } from "@/lib/store/history-store";
import { RunReplay } from "@/components/typing/run-replay";
import { CadenceLogo } from "@/components/logo/cadence-logo";

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-5 text-center">
      <CadenceLogo size={48} animated={false} />
      <h1
        className="text-xl font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h1>
      <p className="text-sm text-[var(--text-dim)]">{body}</p>
      <Link
        href="/stats"
        className="rounded-[var(--radius)] border border-[var(--border-strong)] px-5 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
      >
        Back to stats
      </Link>
    </div>
  );
}

export default function ReplayPage() {
  const params = useParams<{ id: string }>();
  const { runs, ready } = useHistory();

  if (!ready) {
    return (
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[var(--text-faint)]">
        loading run
      </p>
    );
  }

  const run = runs.find((r) => r.id === params.id);

  if (!run) {
    return (
      <Notice
        title="That run is not here"
        body="It may have aged out of your local history, or the link is from a different device."
      />
    );
  }

  if (!run.text) {
    return (
      <Notice
        title="Replay not available"
        body="This run was recorded before replays were added, so the text was not saved. New runs can be replayed."
      />
    );
  }

  return <RunReplay run={run} />;
}
