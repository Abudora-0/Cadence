"use client";

import Link from "next/link";
import { CadenceLogo } from "@/components/logo/cadence-logo";
import { SHORTCUTS } from "@/lib/content/shortcuts";

const REPO = "https://github.com/Abudora-0/Cadence";

const COLUMNS: { label: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    label: "Practice",
    links: [
      { label: "Typing test", href: "/practice" },
      { label: "Daily challenge", href: "/daily" },
      { label: "Your stats", href: "/stats" },
    ],
  },
  {
    label: "Project",
    links: [
      { label: "About", href: "/about" },
      { label: "Source", href: REPO, external: true },
      { label: "MIT license", href: `${REPO}/blob/main/LICENSE`, external: true },
      { label: "Report a bug", href: `${REPO}/issues`, external: true },
    ],
  },
];

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const cls =
    "inline-block text-[0.72rem] text-[var(--text-faint)] transition-colors hover:text-[var(--text)]";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--border)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label="Cadence home">
              <CadenceLogo size={28} withWordmark animated={false} />
            </Link>
            <p className="max-w-xs text-[0.8rem] leading-relaxed text-[var(--text-dim)]">
              A focus first typing trainer that treats speed as rhythm. Type to a
              tempo, tune out the rest.
            </p>
            <p className="mono-label">No account · Local first · Open source</p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.label} className="flex flex-col gap-3">
              <span className="mono-label">{col.label}</span>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href} external={link.external}>
                      {link.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="flex flex-col gap-3">
            <span className="mono-label">Shortcuts</span>
            <ul className="flex flex-col gap-2">
              {SHORTCUTS.map((s) => (
                <li
                  key={s.keys}
                  className="flex items-baseline justify-between gap-3"
                >
                  <kbd className="rounded border border-[var(--border-strong)] px-1.5 py-0.5 font-mono text-[0.56rem] uppercase tracking-[0.1em] text-[var(--text-dim)]">
                    {s.keys}
                  </kbd>
                  <span className="text-right text-[0.68rem] text-[var(--text-faint)]">
                    {s.action}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 sm:flex-row">
          <span className="tick-row h-4 w-40 opacity-40" aria-hidden />
          <span className="mono-label">
            © {new Date().getFullYear()} Cadence
          </span>
        </div>
      </div>
    </footer>
  );
}
