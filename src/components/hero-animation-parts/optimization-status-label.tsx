import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TextDecode } from "@/components/text-decode";

/** Interval between each character starting decode (ms) */
const STAGGER_DELAY = 60;
/** Duration each character stays in scrambling state (ms) */
const SCRAMBLE_DURATION = 50;
/** Duration before fading out the optimized label (ms) */
const FADE_OUT_DELAY = 2000;
/** Duration of fade in animation (ms) */
const FADE_IN_DURATION = 500;

type OptimizationStatusLabelProps = {
  readonly shouldStartDecode: boolean;
  readonly isOptimized: boolean;
};

/**
 * Optimization status label showing processing state with decode effect.
 *
 * - While optimizing: loops "optimizing..." decode animation
 * - When complete: shows "optimized ✓" with glow effect, blinks, then fades out
 */
export function OptimizationStatusLabel({
  shouldStartDecode,
  isOptimized,
}: OptimizationStatusLabelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldBlink, setShouldBlink] = useState(false);

  useEffect(() => {
    if (isOptimized) {
      // Fade in immediately
      setIsVisible(true);

      // Blink after fade in completes
      const blinkTimer = setTimeout(() => {
        setShouldBlink(true);
      }, FADE_IN_DURATION);

      // Fade out after delay
      const fadeOutTimer = setTimeout(() => {
        setIsVisible(false);
      }, FADE_OUT_DELAY);

      return () => {
        clearTimeout(blinkTimer);
        clearTimeout(fadeOutTimer);
      };
    } else {
      setIsVisible(false);
      setShouldBlink(false);
    }
  }, [isOptimized]);

  return (
    <div className="absolute bottom-[30px] left-4 flex items-center gap-1.5 font-mono text-sm">
      {/* Status label with decode effect */}
      <span
        className={cn(
          "relative transition-all duration-300",
          isOptimized ? "text-accent" : "text-accent/60",
        )}
      >
        {/* Waiting state */}
        {!shouldStartDecode && (
          <span className="text-accent/40">waiting...</span>
        )}

        {/* Optimizing state - loops until isOptimized */}
        {shouldStartDecode && !isOptimized && (
          <TextDecode
            from="optimizing..."
            to="optimizing..."
            staggerDelay={STAGGER_DELAY}
            scrambleDuration={SCRAMBLE_DURATION}
            delay={0}
            shouldStop={isOptimized}
            showScanLine={true}
            showCursor={false}
            className="text-accent/70"
          />
        )}

        {/* Optimized state - final result with glow, sweep effect, then fades out */}
        {isOptimized && (
          <span
            className={cn(
              "text-accent font-semibold drop-shadow-[0_0_8px_oklch(0.7_0.18_160/0.4)] transition-opacity duration-700",
              isVisible ? "opacity-100" : "opacity-0",
              shouldBlink && "animate-text-sweep-glow",
            )}
            onAnimationEnd={() => setShouldBlink(false)}
          >
            Success ✓
          </span>
        )}
      </span>
    </div>
  );
}
