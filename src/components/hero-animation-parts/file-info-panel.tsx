"use client";

import { OPTIMIZATION_HIGHLIGHT_DELAY_MS } from "@/components/hero-animation-parts/constants";
import { HighlightValue } from "@/components/hero-animation-parts/highlight-value";
import { cn } from "@/lib/utils";

type FileInfoPanelProps = {
  readonly currentFormat: string;
  readonly currentSize: number;
  readonly reductionPercent: number;
  readonly isOptimized: boolean;
};

/**
 * Displays file optimization statistics (format, size, savings).
 *
 * Each value uses the {@link HighlightValue} component for sweep-glow
 * animation when optimization completes.
 */
export function FileInfoPanel({
  currentFormat,
  currentSize,
  reductionPercent,
  isOptimized,
}: FileInfoPanelProps) {
  return (
    <div className="absolute right-4 bottom-2 flex flex-col items-end gap-1 font-mono text-xs">
      <StatRow label="Format" isOptimized={isOptimized}>
        {currentFormat}
      </StatRow>
      <StatRow label="Size" isOptimized={isOptimized}>
        {currentSize.toLocaleString()}KB
      </StatRow>
      <StatRow label="Saved" isOptimized={isOptimized}>
        {reductionPercent > 0 ? `${reductionPercent}%` : "0%"}
      </StatRow>
    </div>
  );
}

type StatRowProps = {
  readonly label: string;
  readonly isOptimized: boolean;
  readonly children: React.ReactNode;
};

function StatRow({ label, isOptimized, children }: StatRowProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-accent/90 w-18 text-right font-bold tracking-wide uppercase">
        {label}:
      </span>
      <HighlightValue
        isHighlighted={isOptimized}
        delay={OPTIMIZATION_HIGHLIGHT_DELAY_MS}
        className={cn(
          "w-12 text-right font-semibold tabular-nums transition-colors duration-300",
          isOptimized ? "text-accent/90" : "text-accent/50",
        )}
      >
        {children}
      </HighlightValue>
    </div>
  );
}
