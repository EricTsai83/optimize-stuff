"use client";

import { useEffect, useState } from "react";

/** Image formats to cycle through before optimization */
const IMAGE_FORMATS = [
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".tiff",
  ".raw",
] as const;

/** Interval in ms between format switches */
const FORMAT_CYCLE_INTERVAL_MS = 120;

/**
 * Custom hook to cycle through image formats until optimized.
 * When `isOptimized` is false, cycles through various formats.
 * When `isOptimized` becomes true, returns ".webp".
 */
export function useFormatCycle(isOptimized: boolean): string {
  const [formatIndex, setFormatIndex] = useState(0);

  useEffect(() => {
    if (isOptimized) return;

    const intervalId = setInterval(() => {
      setFormatIndex((prev) => (prev + 1) % IMAGE_FORMATS.length);
    }, FORMAT_CYCLE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isOptimized]);

  // Reset index when restarting (isOptimized goes from true to false)
  useEffect(() => {
    if (!isOptimized) {
      setFormatIndex(0);
    }
  }, [isOptimized]);

  if (isOptimized) {
    return ".webp";
  }

  // Default to first format if index is somehow out of bounds
  return IMAGE_FORMATS[formatIndex] ?? IMAGE_FORMATS[0];
}
