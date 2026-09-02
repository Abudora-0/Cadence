"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import clsx from "clsx";

interface MagneticButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  strength?: number;
  variant?: "primary" | "outline";
}

const MotionLink = motion.create(Link);

/**
 * A CTA that eases toward the pointer while hovered. No-ops under
 * prefers-reduced-motion.
 */
export function MagneticButton({
  href,
  children,
  className,
  strength = 8,
  variant = "primary",
}: MagneticButtonProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(Math.max(-strength, Math.min(strength, dx * 0.35)));
    y.set(Math.max(-strength, Math.min(strength, dy * 0.35)));
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <MotionLink
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] px-6 py-3 font-mono text-[0.72rem] uppercase tracking-[0.2em] transition-shadow",
        variant === "primary"
          ? "bg-[var(--primary)] text-[var(--primary-ink)] hover:shadow-[0_0_32px_var(--glow)]"
          : "border border-[var(--border-strong)] text-[var(--text-dim)] hover:border-[var(--primary)] hover:text-[var(--text)]",
        className,
      )}
    >
      {children}
    </MotionLink>
  );
}
