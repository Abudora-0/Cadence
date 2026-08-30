"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { CadenceLogo } from "@/components/logo/cadence-logo";
import { ThemeSwitcher } from "@/components/chrome/theme-switcher";
import { SettingsDrawer } from "@/components/chrome/settings-drawer";
import { CommandPalette } from "@/components/chrome/command-palette";

const NAV = [
  { href: "/", label: "Practice" },
  { href: "/stats", label: "Stats" },
  { href: "/about", label: "About" },
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Cadence home">
            <CadenceLogo size={30} withWordmark />
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const activeLink =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "relative rounded-[var(--radius)] px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.18em] transition-colors",
                    activeLink
                      ? "text-[var(--text)]"
                      : "text-[var(--text-faint)] hover:text-[var(--text-dim)]",
                  )}
                >
                  {activeLink && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2 -bottom-[1px] h-[2px] bg-[var(--primary)]"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open tuning panel"
              className="rounded-[var(--radius)] border border-[var(--border)] p-2 text-[var(--text-dim)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M8 1v3M8 12v3M1 8h3M12 8h3M3.5 3.5l2 2M10.5 10.5l2 2M12.5 3.5l-2 2M5.5 10.5l-2 2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-8 sm:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-[var(--border)] px-4 py-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--text-faint)] sm:flex-row">
          <span>Cadence / tune out the rest</span>
          <span className="flex items-center gap-4">
            <a
              href="https://github.com/Abudora-0/Cadence"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--text-dim)]"
            >
              Source
            </a>
            <span>Local first. No account.</span>
          </span>
        </div>
      </footer>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <CommandPalette onOpenSettings={() => setSettingsOpen(true)} />
    </>
  );
}
