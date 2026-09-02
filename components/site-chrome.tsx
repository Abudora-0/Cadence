"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { CadenceLogo } from "@/components/logo/cadence-logo";
import { ThemeSwitcher } from "@/components/chrome/theme-switcher";
import { SettingsDrawer } from "@/components/chrome/settings-drawer";
import { CommandPalette } from "@/components/chrome/command-palette";
import { SiteFooter } from "@/components/chrome/site-footer";
import { Toaster } from "@/components/chrome/toaster";
import { THEMES } from "@/lib/themes";
import { cycleTheme } from "@/lib/store/theme-store";

const NAV = [
  { href: "/practice", label: "Practice" },
  { href: "/daily", label: "Daily" },
  { href: "/stats", label: "Stats" },
  { href: "/about", label: "About" },
];

const MotionLink = motion.create(Link);

const THEME_ORDER = THEMES.map((t) => t.id);

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/";

  // Shift + T cycles the theme, unless the user is typing into something.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "T" || !e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      cycleTheme(THEME_ORDER);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Cadence home"
          >
            <CadenceLogo size={30} withWordmark />
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const activeLink = pathname.startsWith(item.href);
              return (
                <MotionLink
                  key={item.href}
                  href={item.href}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
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
                </MotionLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <motion.button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open tuning panel"
              whileHover={{ rotate: 20 }}
              whileTap={{ scale: 0.9 }}
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
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              whileTap={{ scale: 0.9 }}
              className="rounded-[var(--radius)] border border-[var(--border)] p-2 text-[var(--text-dim)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)] sm:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d={menuOpen ? "M3 3l10 10M13 3L3 13" : "M2 4h12M2 8h12M2 12h12"}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-[var(--border)] sm:hidden"
            >
              <ul className="mx-auto flex w-full max-w-6xl flex-col px-4 py-2">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={clsx(
                        "block rounded-[var(--radius)] px-3 py-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] transition-colors",
                        pathname.startsWith(item.href)
                          ? "bg-[var(--primary-dim)] text-[var(--text)]"
                          : "text-[var(--text-faint)] hover:text-[var(--text-dim)]",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="w-full flex-1">
        <div
          key={pathname}
          className={clsx(
            "page-in",
            isLanding
              ? "w-full"
              : "mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-16",
          )}
        >
          {children}
        </div>
      </main>

      <SiteFooter />

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <CommandPalette onOpenSettings={() => setSettingsOpen(true)} />
      <Toaster />
    </>
  );
}
