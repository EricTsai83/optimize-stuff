"use client";

import { useEffect, useState, useRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextDecode } from "@/components/text-decode";

/** Total scan animation duration (ms) */
const SCAN_DURATION = 1600;

/** Progress percentage at which decode animation starts */
const DECODE_START_PROGRESS = 20;

/** Interval between each character starting decode (ms) */
const STAGGER_DELAY = 150;

/** Duration each character stays in scrambling state (ms) */
const SCRAMBLE_DURATION = 80;

/** Original file size in KB */
const ORIGINAL_SIZE_KB = 2400;

/** Optimized file size ratio (35% of original) */
const OPTIMIZED_SIZE_RATIO = 0.35;

/** Size reduction rate per progress percentage */
const SIZE_REDUCTION_RATE = 0.0065;

/**
 * Hero section animation component.
 *
 * Displays an image optimization visualization with:
 * - Scanning beam effect
 * - Format conversion (.jpeg → .webp)
 * - File size reduction display
 */
export function HeroAnimation() {
  const [scanProgress, setScanProgress] = useState(0);
  const [isOptimized, setIsOptimized] = useState(false);
  const [shouldStartDecode, setShouldStartDecode] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  // Calculate current file size based on progress
  const currentSize = isOptimized
    ? Math.round(ORIGINAL_SIZE_KB * OPTIMIZED_SIZE_RATIO)
    : Math.round(ORIGINAL_SIZE_KB * (1 - scanProgress * SIZE_REDUCTION_RATE));

  // Scan beam position (0-100%)
  const beamPosition = Math.min(scanProgress, 100);

  useEffect(() => {
    const animate = (timestamp: number): void => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min((elapsed / SCAN_DURATION) * 100, 100);

      setScanProgress(progress);

      // Trigger decode animation when progress reaches threshold
      if (progress >= DECODE_START_PROGRESS && !shouldStartDecode) {
        setShouldStartDecode(true);
      }

      // Mark as optimized when scan completes
      if (progress >= 100 && !isOptimized) {
        setIsOptimized(true);
      }

      // Continue animation until complete
      if (progress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [shouldStartDecode, isOptimized]);

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
        {/* Image placeholder area */}
        <div
          className={cn(
            "absolute top-2 right-2 left-2 rounded transition-colors duration-300",
            isOptimized ? "bg-accent/8" : "bg-accent/5",
          )}
          style={{ height: "calc(100% - 80px)" }}
        />

        {/* Scanning beam effect */}
        {!isOptimized && scanProgress < 100 && (
          <ScanBeam position={beamPosition} />
        )}

        {/* Bottom info section */}
        <div className="absolute right-0 bottom-0 left-0 h-[72px] px-4 pb-2">
          {/* Format conversion label (left) */}
          <FormatConversionLabel shouldStartDecode={shouldStartDecode} />

          {/* File size display (right) */}
          <div className="text-accent/50 absolute right-4 bottom-[30px] font-mono text-sm">
            {currentSize}KB
          </div>

          {/* Progress indicator / completion check */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            {isOptimized ? (
              <Check
                className="text-accent/80 h-6 w-6"
                strokeWidth={3}
                aria-label="Optimization complete"
              />
            ) : (
              <span className="text-accent/70 font-mono text-sm">
                {Math.round(scanProgress)}%
              </span>
            )}
          </div>
        </div>

        {/* Size savings badge (shown after optimization) */}
        {isOptimized && (
          <div
            className="bg-accent/15 text-accent/90 animate-fade-in absolute top-4 right-4 rounded-full px-3 py-1 font-mono text-xs"
            style={{ animationDuration: "0.3s" }}
          >
            size: -65%
          </div>
        )}
      </div>

      {/* Floating particles effect */}
      <FloatingParticles />
    </div>
  );
}

/**
 * Scanning beam effect component
 */
function ScanBeam({ position }: { readonly position: number }) {
  return (
    <div
      className="pointer-events-none absolute right-2 left-2"
      style={{
        top: `calc(8px + ${(position / 100) * (100 - 25)}%)`,
        height: "60px",
        transform: "translateY(-50%)",
      }}
    >
      {/* Beam gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(16, 185, 129, 0.3) 50%, transparent 100%)",
        }}
      />

      {/* Beam line */}
      <div
        className="absolute top-1/2 right-0 left-0 h-[2px] -translate-y-1/2"
        style={{
          background: "rgba(16, 185, 129, 0.6)",
          boxShadow: "0 0 15px 2px rgba(16, 185, 129, 0.8)",
        }}
      />
    </div>
  );
}

/**
 * Format conversion label showing .jpeg → .webp transition
 */
function FormatConversionLabel({
  shouldStartDecode,
}: {
  readonly shouldStartDecode: boolean;
}) {
  return (
    <div className="absolute bottom-[30px] left-4 flex items-center gap-1.5 font-mono text-sm">
      {/* Original format: JPEG */}
      <span
        className={cn(
          "relative transition-colors duration-500",
          shouldStartDecode ? "text-accent/40" : "text-accent/60",
        )}
      >
        .jpeg
        {/* Strikethrough animation (draws from left to right) */}
        <span
          className={cn(
            "bg-accent/60 pointer-events-none absolute top-1/2 left-0 h-[1.5px] origin-left -translate-y-1/2 transition-transform duration-700 ease-out",
            shouldStartDecode ? "scale-x-100" : "scale-x-0",
          )}
          style={{ width: "100%" }}
          aria-hidden="true"
        />
        {/* Underline effect (matching WebP style) */}
        <span
          className="bg-accent/20 pointer-events-none absolute bottom-0 left-0 h-[2px] w-full"
          aria-hidden="true"
        />
      </span>

      {/* Transition arrow */}
      <span
        className={cn(
          "transition-all duration-300",
          shouldStartDecode
            ? "text-accent/70 translate-x-0 opacity-100"
            : "text-accent/30 -translate-x-1 opacity-0",
        )}
      >
        →
      </span>

      {/* Target format: WebP (with decode effect) */}
      <span
        className={cn(
          "transition-all duration-300",
          shouldStartDecode
            ? "translate-x-0 opacity-100"
            : "-translate-x-2 opacity-0",
        )}
      >
        {shouldStartDecode ? (
          <TextDecode
            from=".jpeg"
            to=".webp"
            staggerDelay={STAGGER_DELAY}
            scrambleDuration={SCRAMBLE_DURATION}
            delay={100}
            showScanLine={true}
            showCursor={false}
            className="text-accent"
          />
        ) : null}
      </span>
    </div>
  );
}

/** Number of floating particles */
const PARTICLE_COUNT = 6;

/**
 * Decorative floating particles effect
 */
function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <div
          key={i}
          className="bg-accent/20 absolute h-1 w-1 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `float ${2 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}
