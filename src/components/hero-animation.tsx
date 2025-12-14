"use client";

import { useCallback, useEffect, useState } from "react";
import type { TransitionEvent } from "react";

import { RotateCcw } from "lucide-react";

import {
  OPTIMIZATION_HIGHLIGHT_DELAY_MS,
  OPTIMIZED_SIZE_RATIO,
  ORIGINAL_SIZE_KB,
  SIZE_REDUCTION_RATE,
} from "@/components/hero-animation-parts/constants";
import { HighlightValue } from "@/components/hero-animation-parts/highlight-value";
import { OptimizationStatusLabel } from "@/components/hero-animation-parts/optimization-status-label";
import { PixelDecodeGrid } from "@/components/hero-animation-parts/pixel-decode-grid";
import { useFormatCycle } from "@/hooks/use-format-cycle";
import { useHeroScanAnimation } from "@/hooks/use-hero-scan-animation";
import { cn } from "@/lib/utils";

function getCurrentSizeKb(scanProgress: number, isOptimized: boolean): number {
  if (isOptimized) {
    return Math.round(ORIGINAL_SIZE_KB * OPTIMIZED_SIZE_RATIO);
  }

  return Math.round(
    ORIGINAL_SIZE_KB * (1 - scanProgress * SIZE_REDUCTION_RATE),
  );
}

function getSizeReductionPercent(currentSize: number): number {
  return Math.round(
    ((ORIGINAL_SIZE_KB - currentSize) / ORIGINAL_SIZE_KB) * 100,
  );
}

/**
 * Hero section animation component.
 *
 * Displays an image optimization visualization with:
 * - Scanning beam effect
 * - Format conversion (.jpeg → .webp)
 * - File size reduction display
 */
export function HeroAnimation() {
  const [hasGridDrawnOnce, setHasGridDrawnOnce] = useState(false);
  const [isGridFadeInComplete, setIsGridFadeInComplete] = useState(false);
  const { scanProgress, isOptimized, shouldStartDecode, hasStarted, restart } =
    useHeroScanAnimation(isGridFadeInComplete);

  const currentFormat = useFormatCycle(isOptimized);

  const handleGridFirstDraw = useCallback((): void => {
    setHasGridDrawnOnce(true);
  }, []);

  const handleGridFadeInTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>): void => {
      if (event.propertyName !== "opacity") return;
      if (!hasGridDrawnOnce) return;
      setIsGridFadeInComplete(true);
    },
    [hasGridDrawnOnce],
  );

  const handleRestart = useCallback((): void => {
    // Keep the grid visible on restart (no skeleton flash),
    // and just restart the scan/decode animation.
    restart();
  }, [restart]);

  useEffect(() => {
    if (hasGridDrawnOnce) return;

    // Fallback: if the first canvas draw can't be detected (e.g. 0-size on first layout),
    // still reveal the grid after a short delay so the UI doesn't get stuck on the skeleton.
    const timer = setTimeout(() => {
      setHasGridDrawnOnce(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [hasGridDrawnOnce]);

  useEffect(() => {
    if (!hasGridDrawnOnce) return;
    if (isGridFadeInComplete) return;

    // Fallback for environments that don't reliably fire transitionend.
    const timer = setTimeout(() => {
      setIsGridFadeInComplete(true);
    }, 550);

    return () => clearTimeout(timer);
  }, [hasGridDrawnOnce, isGridFadeInComplete]);

  // Calculate current file size based on progress
  const currentSize = getCurrentSizeKb(scanProgress, isOptimized);
  const reductionPercent = getSizeReductionPercent(currentSize);

  return (
    <div className="relative h-[400px] w-[400px]">
      {/* Optimization status label (left) */}
      <div className="absolute top-7 right-7">
        <OptimizationStatusLabel
          shouldStartDecode={shouldStartDecode}
          isOptimized={isOptimized}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(16 185 129) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(16 185 129) 1px, transparent 1px)
          `,
          backgroundSize: "33.33px 50px",
        }}
      />

      {/* Radial gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.04) 0%, transparent 70%)",
        }}
      />

      {/* Main card container */}
      <div
        className={cn(
          "absolute inset-0 rounded-lg border transition-[box-shadow,background-color,border-color] ease-out will-change-[box-shadow,border-color,background-color]",
          "before:ring-accent/40 before:pointer-events-none before:absolute before:inset-0 before:rounded-lg before:opacity-0 before:ring-2 before:content-[''] before:ring-inset",
          isOptimized
            ? [
                "border-accent/30 ring-accent/20 bg-white/[0.024] ring-1 ring-inset",
                "[transition-delay:500ms] duration-200",
                "before:animate-[hero-card-border-flash_650ms_cubic-bezier(0.25,0.1,0.25,1)_both] before:[animation-delay:500ms]",
              ]
            : "border-accent/10 bg-white/[0.018] [transition-delay:0ms] duration-500",
        )}
      >
        {/* Image placeholder area with pixel decode effect */}
        <div
          className={cn(
            "absolute top-2 right-2 left-2 overflow-hidden rounded transition-colors duration-300",
            // Keep the background stable so the canvas grid doesn't appear to brighten at 100%.
            "bg-accent/5",
          )}
          style={{ height: "calc(100% - 80px)" }}
        >
          {/* Skeleton overlay (covers the initial canvas blank frame) */}
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 z-10 transition-opacity duration-500 will-change-[opacity]",
              hasGridDrawnOnce ? "opacity-0" : "opacity-100",
            )}
          >
            <div className="from-accent/12 to-accent/10 absolute inset-0 bg-linear-to-b via-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.18)_0%,transparent_68%)]" />
            <div className="animate-pulse-soft absolute inset-0 bg-white/4 dark:bg-black/6" />

            {/* Soundwave ripple rings - center out */}
            <div className="absolute top-1/2 left-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2">
              {/* Core pulse dot */}
              <div className="bg-accent/50 absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_16px_rgba(16,185,129,0.7)]" />

              {/* Wave 1 - fastest, most visible */}
              <div className="animate-hero-soundwave border-accent/45 absolute inset-0 rounded-full border-4 shadow-[0_0_24px_rgba(16,185,129,0.25)]" />

              {/* Wave 2 */}
              <div className="animate-hero-soundwave border-accent/35 absolute inset-0 rounded-full border-[3px] shadow-[0_0_20px_rgba(16,185,129,0.2)] [animation-delay:400ms]" />

              {/* Wave 3 */}
              <div className="animate-hero-soundwave border-accent/28 absolute inset-0 rounded-full border-2 shadow-[0_0_16px_rgba(16,185,129,0.15)] [animation-delay:800ms]" />

              {/* Wave 4 */}
              <div className="animate-hero-soundwave border-accent/20 absolute inset-0 rounded-full border-2 shadow-[0_0_12px_rgba(16,185,129,0.1)] [animation-delay:1200ms]" />

              {/* Wave 5 - slowest, most subtle */}
              <div className="animate-hero-soundwave border-accent/14 absolute inset-0 rounded-full border shadow-[0_0_10px_rgba(16,185,129,0.08)] [animation-delay:1600ms]" />
            </div>
          </div>

          {/* Canvas (fade in after first draw) */}
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-500 will-change-[opacity]",
              hasGridDrawnOnce ? "opacity-100" : "opacity-0",
            )}
            onTransitionEnd={handleGridFadeInTransitionEnd}
          >
            <PixelDecodeGrid
              scanProgress={scanProgress}
              isOptimized={isOptimized}
              hasStarted={hasStarted}
              onFirstDraw={handleGridFirstDraw}
            />
          </div>
        </div>

        {/* Bottom info section */}
        <div className="absolute right-0 bottom-0 left-0 h-[72px] px-4 pb-2">
          {/* File size & optimization stats (right) */}
          <div className="absolute right-4 bottom-2 flex flex-col items-end gap-1 font-mono text-xs">
            {/* Format conversion */}
            <div className="flex items-center gap-1.5">
              <span className="text-accent/90 w-18 text-right font-bold tracking-wide uppercase">
                Format:
              </span>
              <HighlightValue
                isHighlighted={isOptimized}
                delay={OPTIMIZATION_HIGHLIGHT_DELAY_MS}
                className={cn(
                  "w-12 text-right font-semibold tabular-nums transition-colors duration-300",
                  isOptimized ? "text-accent/90" : "text-accent/50",
                )}
              >
                {currentFormat}
              </HighlightValue>
            </div>

            {/* Current file size */}
            <div className="flex items-center gap-1.5">
              <span className="text-accent/90 w-18 text-right font-bold tracking-wide uppercase">
                Size:
              </span>
              <HighlightValue
                isHighlighted={isOptimized}
                delay={OPTIMIZATION_HIGHLIGHT_DELAY_MS}
                className={cn(
                  "w-12 text-right font-semibold tabular-nums transition-colors duration-300",
                  isOptimized ? "text-accent/90" : "text-accent/50",
                )}
              >
                {currentSize.toLocaleString()}KB
              </HighlightValue>
            </div>

            {/* Size reduction percentage */}
            <div className="flex items-center gap-1.5">
              <span className="text-accent/90 w-18 text-right font-bold tracking-wide uppercase">
                Saved:
              </span>
              <HighlightValue
                isHighlighted={isOptimized}
                delay={OPTIMIZATION_HIGHLIGHT_DELAY_MS}
                className={cn(
                  "w-12 text-right font-semibold tabular-nums transition-colors duration-300",
                  isOptimized ? "text-accent/90" : "text-accent/50",
                )}
              >
                {reductionPercent > 0 ? `${reductionPercent}%` : "0%"}
              </HighlightValue>
            </div>
          </div>

          {/* Progress ring / replay button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <button
              type="button"
              onClick={isOptimized ? handleRestart : undefined}
              disabled={!isOptimized}
              aria-label={
                isOptimized
                  ? "restart animation"
                  : `progress ${Math.round(scanProgress)}%`
              }
              className={cn(
                "group relative flex h-8 w-8 items-center justify-center transition-all duration-300",
                isOptimized
                  ? [
                      "cursor-pointer",
                      "hover:scale-110",
                      "focus-visible:ring-accent/50 focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none",
                      "active:scale-95",
                    ]
                  : "cursor-default",
              )}
            >
              {/* Circular progress ring */}
              <svg
                className={cn(
                  "absolute inset-0 -rotate-90 transition-opacity duration-500",
                  isOptimized ? "opacity-0" : "opacity-100",
                )}
                viewBox="0 0 32 32"
                aria-hidden="true"
              >
                {/* Background ring */}
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.15)"
                  strokeWidth="2"
                />
                {/* Progress ring */}
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={87.96}
                  strokeDashoffset={87.96 * (1 - scanProgress / 100)}
                />
              </svg>

              {/* Pulsing dot in center during progress */}
              <span
                className={cn(
                  "bg-accent/60 absolute h-2 w-2 rounded-full transition-all duration-300",
                  isOptimized
                    ? "scale-0 opacity-0"
                    : "scale-100 animate-pulse opacity-100",
                )}
              />

              {/* Completed state: filled circle background */}
              <span
                className={cn(
                  "bg-accent/15 border-accent/40 absolute inset-0 rounded-full border transition-all duration-300",
                  isOptimized
                    ? "group-hover:border-accent/60 group-hover:bg-accent/20 scale-100 opacity-100 shadow-[0_0_12px_rgba(16,185,129,0.25)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                    : "scale-0 opacity-0",
                )}
              />

              {/* Replay icon (scales in when complete) */}
              <RotateCcw
                className={cn(
                  "text-accent relative z-10 h-4 w-4 transition-all duration-300",
                  isOptimized
                    ? "scale-100 opacity-100 group-hover:-rotate-45"
                    : "scale-0 opacity-0",
                )}
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
