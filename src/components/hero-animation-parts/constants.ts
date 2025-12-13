/** Original file size in KB */
export const ORIGINAL_SIZE_KB = 2400;

/** Optimized file size ratio (35% of original) */
export const OPTIMIZED_SIZE_RATIO = 0.35;

/** Size reduction rate per progress percentage */
export const SIZE_REDUCTION_RATE = 0.0065;

/** Grid configuration for pixel blocks */
export const GRID_COLS = 38;
export const GRID_ROWS = 17;

/**
 * Delay (ms) before we apply "optimized" highlight accents.
 *
 * Keep this in sync with any visual "flash" / highlight timing.
 */
export const OPTIMIZATION_HIGHLIGHT_DELAY_MS = 500;

/**
 * How many rows *before* the scan beam reaches a row we begin decoding.
 *
 * This uses a continuous ramp so that at the exact moment the beam reaches a row
 * (distanceFromScan === 0), it is already fully decoded.
 */
export const DECODE_RAMP_ROWS = 2.8;

/**
 * Finish the decode this many rows *before* the scan exits the text band.
 *
 * Larger value = finish earlier.
 */
export const DECODE_END_EARLY_ROWS = 1;

/** Distance (in rows) within which pixels show scrambled pattern */
export const SCRAMBLE_RANGE = 1;

/** Scan line glow half thickness (in px) */
export const SCAN_GLOW_HALF_THICKNESS_PX = 12;

/** Accent color RGB components */
export const ACCENT_R = 16;
export const ACCENT_G = 185;
export const ACCENT_B = 129;

/**
 * Formats an RGBA string for the shared accent color.
 */
export function accentRgba(alpha: number): string {
  return `rgba(${ACCENT_R}, ${ACCENT_G}, ${ACCENT_B}, ${alpha})`;
}
