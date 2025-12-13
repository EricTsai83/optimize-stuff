import {
  GRID_COLS,
  GRID_ROWS,
} from "@/components/hero-animation-parts/constants";
import {
  JPEG_PATTERN,
  SCRAMBLE_PATTERN,
  WEBP_PATTERN,
  isPatternFilled,
} from "@/components/hero-animation-parts/pixel-patterns";

export type PixelBlock = {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  /** Random offset for visual variety */
  readonly offsetX: number;
  readonly offsetY: number;
  /** JPEG artifact simulation - size variation */
  readonly jpegSizeMultiplier: number;
  /** Shared background opacity for non-letter cells (stable across JPEG/WebP) */
  readonly backgroundOpacity: number;
  /** JPEG letter cells opacity (stronger than background) */
  readonly jpegPatternOpacity: number;
  /** WebP letter cells opacity (stronger than background) */
  readonly webpPatternOpacity: number;
  /** Decode animation delay based on position */
  readonly decodeDelay: number;
  /** Whether this block is part of the JPEG text pattern */
  readonly isJpegPattern: boolean;
  /** Whether this block is part of the WebP text pattern */
  readonly isWebpPattern: boolean;
  /** Whether this block is part of the scramble pattern */
  readonly isScramblePattern: boolean;
};

/**
 * Round a number to a fixed precision to avoid hydration mismatch
 * between server and client due to floating-point differences.
 */
function roundToPrecision(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Deterministic pseudo-random generator used to keep visuals stable.
 */
function getPseudoRandom(seed: number, offset: number): number {
  const x = Math.sin(seed * 9999 + offset) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate stable pixel blocks with random variations.
 */
function generatePixelBlocks(): readonly PixelBlock[] {
  const blocks: PixelBlock[] = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      // Use deterministic "random" based on position
      const seed = row * GRID_COLS + col;

      const isJpegPattern = isPatternFilled(
        JPEG_PATTERN,
        row,
        col,
        GRID_ROWS,
        GRID_COLS,
      );
      const isWebpPattern = isPatternFilled(
        WEBP_PATTERN,
        row,
        col,
        GRID_ROWS,
        GRID_COLS,
      );
      const isScramblePattern = isPatternFilled(
        SCRAMBLE_PATTERN,
        row,
        col,
        GRID_ROWS,
        GRID_COLS,
      );

      // Round all random values to 3 decimal places to ensure
      // consistent results between server and client rendering
      const rand1 = roundToPrecision(getPseudoRandom(seed, 1), 3);
      const rand2 = roundToPrecision(getPseudoRandom(seed, 2), 3);
      const rand3 = roundToPrecision(getPseudoRandom(seed, 3), 3);
      const rand4 = roundToPrecision(getPseudoRandom(seed, 4), 3);
      const rand5 = roundToPrecision(getPseudoRandom(seed, 5), 3);
      const rand6 = roundToPrecision(getPseudoRandom(seed, 6), 3);

      // Shared background grid opacity so JPEG/WebP have the same "base grid" look.
      // Pattern blocks still get their own stronger opacities below.
      const backgroundOpacity = roundToPrecision(0.04 + rand4 * 0.07, 3);
      const jpegPatternOpacity = roundToPrecision(0.5 + rand4 * 0.3, 3);
      // Make WebP letters more prominent after decode completes.
      const webpPatternOpacity = roundToPrecision(0.74 + rand5 * 0.2, 3);

      blocks.push({
        id: `${row}-${col}`,
        row,
        col,
        // JPEG has more chaotic positioning
        offsetX: roundToPrecision((rand1 - 0.5) * 2, 3),
        offsetY: roundToPrecision((rand2 - 0.5) * 2, 3),
        // JPEG blocks vary in size (compression artifacts)
        jpegSizeMultiplier: roundToPrecision(0.7 + rand3 * 0.6, 3),
        backgroundOpacity,
        jpegPatternOpacity,
        webpPatternOpacity,
        // Decode delay based on row (top to bottom with scan)
        decodeDelay: roundToPrecision(rand6 * 80, 3),
        isJpegPattern,
        isWebpPattern,
        isScramblePattern,
      });
    }
  }

  return blocks;
}

/** Pre-computed pixel blocks (calculated once at module load) */
export const PIXEL_BLOCKS = generatePixelBlocks();
