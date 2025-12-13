"use client";

import { RotateCcw } from "lucide-react";

import { FormatConversionLabel } from "@/components/hero-animation-parts/format-conversion-label";
import {
  OPTIMIZED_SIZE_RATIO,
  ORIGINAL_SIZE_KB,
  SIZE_REDUCTION_RATE,
} from "@/components/hero-animation-parts/constants";
import { PixelDecodeGrid } from "@/components/hero-animation-parts/pixel-decode-grid";
import { ScanBeam } from "@/components/hero-animation-parts/scan-beam";
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

function getBeamPosition(scanProgress: number): number {
  return Math.min(scanProgress, 100);
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
  const { scanProgress, isOptimized, shouldStartDecode, hasStarted, restart } =
    useHeroScanAnimation();

  // Calculate current file size based on progress
  const currentSize = getCurrentSizeKb(scanProgress, isOptimized);

  // Scan beam position (0-100%)
  const beamPosition = getBeamPosition(scanProgress);

  return (
    <div className="relative h-[400px] w-[400px]">
      {/* Background grid pattern */}
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
          "absolute inset-0 rounded-lg border transition-all duration-300",
          isOptimized
            ? "border-accent/30 bg-white/[0.024]"
            : "border-accent/20 bg-white/[0.018]",
        )}
      >
        {/* Image placeholder area with pixel decode effect */}
        <div
          className={cn(
            "absolute top-2 right-2 left-2 overflow-hidden rounded transition-colors duration-300",
            isOptimized ? "bg-accent/8" : "bg-accent/5",
          )}
          style={{ height: "calc(100% - 80px)" }}
        >
          <PixelDecodeGrid
            scanProgress={scanProgress}
            isOptimized={isOptimized}
            hasStarted={hasStarted}
          />

          {/* Scanning beam effect (kept within the image area) */}
          {!isOptimized && scanProgress < 100 && (
            <ScanBeam position={beamPosition} />
          )}
        </div>

        {/* Bottom info section */}
        <div className="absolute right-0 bottom-0 left-0 h-[72px] px-4 pb-2">
          {/* Format conversion label (left) */}
          <FormatConversionLabel shouldStartDecode={shouldStartDecode} />

          {/* File size display (right) */}
          <div className="text-accent/50 absolute right-4 bottom-[30px] font-mono text-sm">
            {currentSize}KB
          </div>

          {/* Progress ring / replay button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <button
              type="button"
              onClick={isOptimized ? restart : undefined}
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

        {/* Size savings badge (shown after optimization) */}
        {isOptimized && (
          <div
            className="bg-accent/15 text-accent/90 animate-fade-in absolute top-6 right-6 rounded-full px-3 py-1 font-mono text-xs"
            style={{ animationDuration: "0.3s" }}
          >
            size: -65%
          </div>
        )}
      </div>
    </div>
  );
}
