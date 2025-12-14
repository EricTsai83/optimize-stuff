"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type HighlightValueProps = {
  readonly children: React.ReactNode;
  readonly isHighlighted: boolean;
  /** Delay before highlight animation starts (ms) */
  readonly delay?: number;
  readonly className?: string;
};

/**
 * A value display that triggers a sweep-glow animation when highlighted.
 * Reusable component for stats that need to flash when optimization completes.
 */
export function HighlightValue({
  children,
  isHighlighted,
  delay = 0,
  className,
}: HighlightValueProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isHighlighted) {
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setShouldAnimate(false);
    }
  }, [isHighlighted, delay]);

  return (
    <span
      className={cn(className, shouldAnimate && "animate-text-sweep-glow")}
      onAnimationEnd={() => setShouldAnimate(false)}
    >
      {children}
    </span>
  );
}
