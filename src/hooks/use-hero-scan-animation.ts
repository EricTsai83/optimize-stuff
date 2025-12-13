import { useCallback, useEffect, useRef, useState } from "react";

/** Total scan animation duration (ms) */
const SCAN_DURATION = 1600;

/** Progress percentage at which decode animation starts */
const DECODE_START_PROGRESS = 10;

type UseHeroScanAnimationState = {
  readonly scanProgress: number;
  readonly isOptimized: boolean;
  readonly shouldStartDecode: boolean;
  /** Track if animation has started (to avoid hydration mismatch) */
  readonly hasStarted: boolean;
  /** Restarts the scan + decode animation from the beginning */
  readonly restart: () => void;
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
  const [animationRunId, setAnimationRunId] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const restart = useCallback((): void => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    startTimeRef.current = null;
    setScanProgress(0);
    setIsOptimized(false);
    setShouldStartDecode(false);
    setHasStarted(false);
    setAnimationRunId((prev) => prev + 1);
  }, []);

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
      setShouldStartDecode((prev) => prev || progress >= DECODE_START_PROGRESS);

      // Mark as optimized when scan completes
      setIsOptimized((prev) => prev || progress >= 100);

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
  }, [animationRunId]);

  return {
    scanProgress,
    isOptimized,
    shouldStartDecode,
    hasStarted,
    restart,
  };
}
