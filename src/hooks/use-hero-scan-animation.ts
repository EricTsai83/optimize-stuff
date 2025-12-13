import { useEffect, useRef, useState } from "react";

/** Total scan animation duration (ms) */
const SCAN_DURATION = 1600;

/** Progress percentage at which decode animation starts */
const DECODE_START_PROGRESS = 20;

type UseHeroScanAnimationState = {
  readonly scanProgress: number;
  readonly isOptimized: boolean;
  readonly shouldStartDecode: boolean;
  /** Track if animation has started (to avoid hydration mismatch) */
  readonly hasStarted: boolean;
};

/**
 * Encapsulates the scan animation state machine used by {@link HeroAnimation}.
 *
 * This keeps the requestAnimationFrame loop stable and makes the UI component
 * mostly declarative.
 */
export function useHeroScanAnimation(): UseHeroScanAnimationState {
  const [scanProgress, setScanProgress] = useState(0);
  const [isOptimized, setIsOptimized] = useState(false);
  const [shouldStartDecode, setShouldStartDecode] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number): void => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
        // Mark animation as started on first frame
        setHasStarted(true);
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

  return {
    scanProgress,
    isOptimized,
    shouldStartDecode,
    hasStarted,
  };
}
