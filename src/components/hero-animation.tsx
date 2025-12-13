"use client";

import { useEffect, useRef, useCallback } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextDecode } from "@/components/text-decode";
import { useHeroScanAnimation } from "@/hooks/use-hero-scan-animation";

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

/** Grid configuration for pixel blocks */
const GRID_COLS = 38;
const GRID_ROWS = 17;

/** Block decode animation duration (ms) */
const BLOCK_DECODE_DURATION = 250;

/** Fixed pattern width for consistent centering */
const PATTERN_WIDTH = 32;

/** Fixed pattern height */
const PATTERN_HEIGHT = 11;

/**
 * Helper to pad pattern lines to exact width
 */
function pad(value: string): string {
  return value.padEnd(PATTERN_WIDTH, " ");
}

/**
 * Pad a string to a fixed width (for letter blocks).
 */
function padToWidth(value: string, width: number): string {
  return value.padEnd(width, " ");
}

/**
 * Pixel font patterns for "JPEG" (11 rows × 32 cols)
 * Layout: 1sp + J(6) + 2sp + P(6) + 2sp + E(6) + 2sp + G(6) + 1sp = 32
 *
 * We keep the pattern box (32×11) symmetric so it's centered inside the grid.
 */
const JPEG_PATTERN: readonly string[] = buildJpegPattern();

/**
 * Pixel font patterns for "WebP" (11 rows × 32 cols)
 * Layout: 1sp + W(7) + 2sp + e(5) + 2sp + b(6) + 2sp + P(6) + 1sp = 32
 *
 * Note: `e` and `b` are lowercase and their bottoms align with `W` and `P`.
 */
const WEBP_PATTERN: readonly string[] = buildWebpPattern();

/**
 * Build a 32×11 pattern for "JPEG" with symmetric whitespace.
 */
function buildJpegPattern(): readonly string[] {
  const J_WIDTH = 6;
  const P_WIDTH = 6;
  const E_WIDTH = 6;
  const G_WIDTH = 6;

  // Note: The grid centering already adds 3 empty cols on each side (38 - 32 = 6).
  // Use 1-col padding here so the perceived outer margin is 3 + 1 = 4 cols.
  const LEFT_PAD = " ";
  const RIGHT_PAD = " ";
  const GAP = "  ";
  const GAP_BEFORE_G = "  ";

  const jRows = [
    "######",
    "    # ",
    "    # ",
    "    # ",
    "    # ",
    "    # ",
    "#   # ",
    "#   # ",
    " ###  ",
  ].map((row) => padToWidth(row, J_WIDTH));

  const pRows = [
    "#####",
    "#    #",
    "#    #",
    "#    #",
    "##### ",
    "#     ",
    "#     ",
    "#     ",
    "#     ",
  ].map((row) => padToWidth(row, P_WIDTH));

  const eRows = [
    "######",
    "#     ",
    "#     ",
    "#     ",
    "######",
    "#     ",
    "#     ",
    "#     ",
    "######",
  ].map((row) => padToWidth(row, E_WIDTH));

  const gRows = [
    " #####",
    "#     ",
    "#     ",
    "#     ",
    "# ### ",
    "#    #",
    "#    #",
    "#    #",
    "##### ",
  ].map((row) => padToWidth(row, G_WIDTH));

  const rows: string[] = [pad("")];
  for (let i = 0; i < 9; i++) {
    rows.push(
      pad(
        `${LEFT_PAD}${jRows[i]}${GAP}${pRows[i]}${GAP}${eRows[i]}${GAP_BEFORE_G}${gRows[i]}${RIGHT_PAD}`,
      ),
    );
  }
  rows.push(pad(""));

  return rows;
}

/**
 * Build a 32×11 pattern for "WebP" with symmetric whitespace and a shared baseline.
 */
function buildWebpPattern(): readonly string[] {
  const W_WIDTH = 7;
  const E_WIDTH = 5;
  const B_WIDTH = 6;
  const P_WIDTH = 6;

  const LEFT_PAD = " ";
  const RIGHT_PAD = " ";
  const GAP = "  ";

  // W (7 cols) with clearer inner diagonals.
  const wRows = [
    "#     #",
    "#     #",
    "#  #  #",
    "#  #  #",
    "#  #  #",
    "#  #  #",
    "# # # #",
    "##   ##",
    "#     #",
  ].map((row) => padToWidth(row, W_WIDTH));

  // Lowercase e: baseline-aligned with W/P (last row).
  const eRows = [
    "     ",
    "     ",
    "     ",
    " ### ",
    "#   #",
    "#####",
    "#    ",
    "#   #",
    " ####",
  ].map((row) => padToWidth(row, E_WIDTH));

  // Lowercase b: ascender, baseline-aligned.
  const bRows = [
    "      ",
    "#     ",
    "#     ",
    "#     ",
    "##### ",
    "#    #",
    "#    #",
    "#    #",
    "##### ",
  ].map((row) => padToWidth(row, B_WIDTH));

  const pRows = [
    "##### ",
    "#    #",
    "#    #",
    "#    #",
    "##### ",
    "#     ",
    "#     ",
    "#     ",
    "#     ",
  ].map((row) => padToWidth(row, P_WIDTH));

  const rows: string[] = [pad("")];
  for (let i = 0; i < 9; i++) {
    rows.push(
      pad(
        `${LEFT_PAD}${wRows[i]}${GAP}${eRows[i]}${GAP}${bRows[i]}${GAP}${pRows[i]}${RIGHT_PAD}`,
      ),
    );
  }
  rows.push(pad(""));

  return rows;
}

/**
 * Scrambled noise pattern (11 rows × 32 cols)
 *
 * Generated deterministically so it stays stable between renders.
 */
const SCRAMBLE_PATTERN: readonly string[] = buildScramblePattern();

function buildScramblePattern(): readonly string[] {
  const rows: string[] = [];
  for (let row = 0; row < PATTERN_HEIGHT; row++) {
    let line = "";
    for (let col = 0; col < PATTERN_WIDTH; col++) {
      const seed = (row + 1) * 9999 + (col + 1) * 1234;
      const value = Math.sin(seed) * 10000;
      const rand = value - Math.floor(value);
      line += rand > 0.58 ? "#" : " ";
    }
    rows.push(pad(line));
  }
  return rows;
}

/**
 * Check if a position should be filled in the pattern
 */
function isPatternFilled(
  pattern: readonly string[],
  row: number,
  col: number,
  gridRowCount: number,
  gridColCount: number,
): boolean {
  // Use fixed dimensions for consistent centering
  const patternRows = PATTERN_HEIGHT;
  const patternCols = PATTERN_WIDTH;

  // Center the pattern in the grid using Math.round for better centering
  const startRow = Math.round((gridRowCount - patternRows) / 2);
  const startCol = Math.round((gridColCount - patternCols) / 2);

  const patternRow = row - startRow;
  const patternCol = col - startCol;

  if (
    patternRow < 0 ||
    patternRow >= patternRows ||
    patternCol < 0 ||
    patternCol >= patternCols
  ) {
    return false;
  }

  const char = pattern[patternRow]?.[patternCol];
  return char === "#";
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
  const { scanProgress, isOptimized, shouldStartDecode, hasStarted } =
    useHeroScanAnimation();

  // Calculate current file size based on progress
  const currentSize = isOptimized
    ? Math.round(ORIGINAL_SIZE_KB * OPTIMIZED_SIZE_RATIO)
    : Math.round(ORIGINAL_SIZE_KB * (1 - scanProgress * SIZE_REDUCTION_RATE));

  // Scan beam position (0-100%)
  const beamPosition = Math.min(scanProgress, 100);

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
        </div>

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

/** Beam height in pixels */
const BEAM_HEIGHT = 60;

/** Half of beam height - used for offset calculations */
const BEAM_OFFSET = BEAM_HEIGHT / 2;

/**
 * Scanning beam effect component
 */
function ScanBeam({ position }: { readonly position: number }) {
  // Start from BEAM_OFFSET so the glow doesn't exceed the top boundary
  // End at (100% - 25% - BEAM_OFFSET) so it doesn't exceed the bottom
  return (
    <div
      className="pointer-events-none absolute right-2 left-2"
      style={{
        top: `calc(8px + ${BEAM_OFFSET}px + ${(position / 100) * (100 - 25)}% - ${(position / 100) * BEAM_OFFSET}px)`,
        height: `${BEAM_HEIGHT}px`,
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

type PixelBlock = {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  /** Random offset for visual variety */
  readonly offsetX: number;
  readonly offsetY: number;
  /** JPEG artifact simulation - size variation */
  readonly jpegSizeMultiplier: number;
  /** JPEG artifact simulation - opacity variation */
  readonly jpegOpacity: number;
  /** WebP clean appearance - uniform sizing */
  readonly webpOpacity: number;
  /** Decode animation delay based on position */
  readonly decodeDelay: number;
  /** Whether this block is part of the JPEG text pattern */
  readonly isJpegPattern: boolean;
  /** Whether this block is part of the WebP text pattern */
  readonly isWebpPattern: boolean;
  /** Whether this block is part of the scramble pattern */
  readonly isScramblePattern: boolean;
};

type BlockTransitionState = {
  opacity: number;
  scale: number;
};

type DrawFn = () => void;

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
 * Generate stable pixel blocks with random variations
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

      blocks.push({
        id: `${row}-${col}`,
        row,
        col,
        // JPEG has more chaotic positioning
        offsetX: roundToPrecision((rand1 - 0.5) * 2, 3),
        offsetY: roundToPrecision((rand2 - 0.5) * 2, 3),
        // JPEG blocks vary in size (compression artifacts)
        jpegSizeMultiplier: roundToPrecision(0.7 + rand3 * 0.6, 3),
        // JPEG pattern blocks are more visible
        jpegOpacity: roundToPrecision(
          isJpegPattern ? 0.5 + rand4 * 0.3 : 0.05 + rand4 * 0.08,
          3,
        ),
        // WebP pattern blocks are more visible
        webpOpacity: roundToPrecision(
          isWebpPattern ? 0.6 + rand5 * 0.2 : 0.03 + rand5 * 0.05,
          3,
        ),
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
const PIXEL_BLOCKS = generatePixelBlocks();

/** Distance (in rows) within which pixels show scrambled pattern */
const SCRAMBLE_RANGE = 1;

/** Accent color RGB components */
const ACCENT_R = 16;
const ACCENT_G = 185;
const ACCENT_B = 129;

/**
 * Formats an RGBA string for the shared accent color.
 *
 * Keep this centralized so we don't accidentally diverge style strings.
 */
function accentRgba(alpha: number): string {
  return `rgba(${ACCENT_R}, ${ACCENT_G}, ${ACCENT_B}, ${alpha})`;
}

/**
 * Pixel decode grid component (Canvas-based for performance)
 *
 * Displays a grid of blocks that spell "JPEG" initially,
 * then transform to spell "WebP" as the scan beam passes.
 * Uses Canvas rendering to avoid 448+ DOM nodes.
 */
function PixelDecodeGrid({
  scanProgress,
  isOptimized,
  hasStarted,
}: {
  readonly scanProgress: number;
  readonly isOptimized: boolean;
  readonly hasStarted: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawRef = useRef<DrawFn>(() => {});

  // Store transition states for smooth animations
  const blockStatesRef = useRef<Map<string, BlockTransitionState>>(new Map());

  // Draw function using useCallback for stability
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size with device pixel ratio for sharpness
    if (
      canvas.width !== containerWidth * dpr ||
      canvas.height !== containerHeight * dpr
    ) {
      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;
      ctx.scale(dpr, dpr);
    } else {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    const padding = 8;
    const gap = 1;
    const cellWidth =
      (containerWidth - padding * 2 - gap * (GRID_COLS - 1)) / GRID_COLS;
    const cellHeight =
      (containerHeight - padding * 2 - gap * (GRID_ROWS - 1)) / GRID_ROWS;

    // Calculate current scan row
    const currentScanRow = (scanProgress / 100) * GRID_ROWS;

    // Draw each block
    for (const block of PIXEL_BLOCKS) {
      const x = padding + block.col * (cellWidth + gap);
      const y = padding + block.row * (cellHeight + gap);

      // Calculate visual state
      const distanceFromScan = currentScanRow - block.row;
      // Start decoding immediately when beam passes (threshold: 0.3)
      const isDecoded = distanceFromScan > 0.3 || isOptimized;
      const isScrambling =
        hasStarted &&
        !isOptimized &&
        !isDecoded &&
        Math.abs(distanceFromScan) < SCRAMBLE_RANGE;
      const showJpeg = !isScrambling && !isDecoded;
      const showScrambleBlock = isScrambling && block.isScramblePattern;

      // Get or initialize block transition state
      let state = blockStatesRef.current.get(block.id);
      if (!state) {
        state = { opacity: showJpeg ? 1 : 0, scale: isDecoded ? 1 : 0 };
        blockStatesRef.current.set(block.id, state);
      }

      // Smoothly transition states (faster decode speed)
      const transitionSpeed = 0.35;
      const targetWebpOpacity = isDecoded ? 1 : 0;
      const targetScale = isDecoded ? 1 : 0;
      state.opacity += (targetWebpOpacity - state.opacity) * transitionSpeed;
      state.scale += (targetScale - state.scale) * transitionSpeed;

      // Draw JPEG block (fading out)
      if (showJpeg || state.opacity < 0.99) {
        const jpegOpacity = showJpeg
          ? block.jpegOpacity
          : block.jpegOpacity * (1 - state.opacity);
        if (jpegOpacity > 0.01) {
          ctx.fillStyle = accentRgba(jpegOpacity);
          ctx.fillRect(x, y, cellWidth, cellHeight);

          // Glow for JPEG pattern blocks
          if (block.isJpegPattern && jpegOpacity > 0.3) {
            ctx.shadowColor = accentRgba(0.4);
            ctx.shadowBlur = 4;
            ctx.fillRect(x, y, cellWidth, cellHeight);
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw scramble block
      if (showScrambleBlock) {
        ctx.fillStyle = accentRgba(0.5);
        ctx.fillRect(x, y, cellWidth, cellHeight);
      }

      // Draw WebP block (scaling in)
      if (state.scale > 0.01) {
        const webpOpacity = block.webpOpacity * state.opacity;
        const scaledWidth = cellWidth * state.scale;
        const scaledHeight = cellHeight * state.scale;
        const offsetX = (cellWidth - scaledWidth) / 2;
        const offsetY = (cellHeight - scaledHeight) / 2;

        ctx.fillStyle = accentRgba(webpOpacity);
        ctx.fillRect(x + offsetX, y + offsetY, scaledWidth, scaledHeight);

        // Glow for WebP pattern blocks
        if (block.isWebpPattern && webpOpacity > 0.3) {
          ctx.shadowColor = accentRgba(0.3);
          ctx.shadowBlur = 3;
          ctx.fillRect(x + offsetX, y + offsetY, scaledWidth, scaledHeight);
          ctx.shadowBlur = 0;
        }
      }
    }

    // Draw scan line glow
    if (!isOptimized && scanProgress < 100) {
      const scanY = (scanProgress / 100) * containerHeight;
      const gradient = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 12);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(0.5, accentRgba(0.2));
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 12, containerWidth, 24);
    }
  }, [scanProgress, isOptimized, hasStarted]);

  // Keep a stable ref to the latest draw implementation.
  // This avoids re-registering ResizeObserver every animation frame.
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  // Redraw on state changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      drawRef.current();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
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
