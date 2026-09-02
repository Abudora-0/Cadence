"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import clsx from "clsx";

interface RevealProps {
  children: ReactNode;
  /** Delay in ms before the transition starts once in view. */
  delay?: number;
  as?: ElementType;
  className?: string;
}

/**
 * Fades + rises its children in when scrolled into view. Uses a CSS transition
 * (compositor driven), so it still completes if the JS frame loop is throttled.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // No observer available (very old browser / test env): just show it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-shown={shown}
      style={delay ? { ["--reveal-delay" as string]: `${delay}ms` } : undefined}
      className={clsx("reveal", className)}
    >
      {children}
    </Tag>
  );
}
