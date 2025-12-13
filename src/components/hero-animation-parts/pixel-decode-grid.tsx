import { useCallback, useEffect, useRef } from "react";

import {
  DECODE_END_EARLY_ROWS,
  DECODE_RAMP_ROWS,
  GRID_COLS,
  GRID_ROWS,
  SCAN_GLOW_HALF_THICKNESS_PX,
  SCRAMBLE_RANGE,
  accentRgba,
} from "@/components/hero-animation-parts/constants";
import { PIXEL_BLOCKS } from "@/components/hero-animation-parts/pixel-blocks";

/**
 * Flash animation timing (tuned for a softer fade-out):
 * - Delay: wait for fade-in to complete
 * - Main duration: 2.0s
 * - Peak at 8%
 * - Easing: cubic-bezier(0, 0, 0.2, 1)
 */
const FLASH_DELAY_MS = 500;
const FLASH_DURATION_MS = 3000;
const FLASH_PEAK_PERCENT = 0.08;
const FLASH_END_INTENSITY_EPSILON = 0.002;
const FLASH_DECAY_RATE = 4;
const FLASH_FADE_EASING_EXPONENT = 0.75;
const FLASH_TAIL_DURATION_MS = 2000;
const FLASH_TAIL_DECAY_RATE = 3;

/**
 * Calculates the base flash intensity during the main flash segment (0..1 progress).
 */
function getMainFlashIntensity(mainProgress01: number): number {
  const progress01 = clamp01(mainProgress01);

  if (progress01 <= FLASH_PEAK_PERCENT) {
    // 0% -> 8%: quick ramp up to peak
    const rampProgress = progress01 / FLASH_PEAK_PERCENT;
    // Ease out for quick rise
    return 1 - Math.pow(1 - rampProgress, 2);
  }

  // 8% -> 100%: smooth fade out
  const fadeProgress =
    (progress01 - FLASH_PEAK_PERCENT) / (1 - FLASH_PEAK_PERCENT);

  // Use exponential decay for a smooth fade-out.
  // We ease the progress slightly so it doesn't "drop off a cliff" near the end.
  const easedFadeProgress = Math.pow(
    Math.max(0, fadeProgress),
    FLASH_FADE_EASING_EXPONENT,
  );
  return Math.exp(-FLASH_DECAY_RATE * easedFadeProgress);
}

/**
 * Calculates the flash intensity for a given elapsed time (ms) since flash start.
 *
 * This treats the animation as two segments:
 * - Main segment: {@link FLASH_DURATION_MS}
 * - Tail segment: {@link FLASH_TAIL_DURATION_MS}
 */
function getFlashIntensityForElapsedMs(elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;

  const mainProgress = elapsedMs / FLASH_DURATION_MS;
  const mainIntensity = getMainFlashIntensity(Math.min(mainProgress, 1));

  if (mainProgress <= 1) return mainIntensity;

  const tailProgress = (elapsedMs - FLASH_DURATION_MS) / FLASH_TAIL_DURATION_MS;
  return mainIntensity * Math.exp(-FLASH_TAIL_DECAY_RATE * tailProgress);
}

function isDarkModeEnabled(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

type DrawFn = () => void;

type TextRowBounds = {
  readonly minRow: number;
  readonly maxRow: number;
};

function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function getTextRowBounds(): TextRowBounds {
  let minRow = GRID_ROWS - 1;
  let maxRow = 0;

  for (const block of PIXEL_BLOCKS) {
    if (!block.isJpegPattern && !block.isWebpPattern) continue;

    if (block.row < minRow) minRow = block.row;
    if (block.row > maxRow) maxRow = block.row;
  }

  return { minRow, maxRow };
}

const TEXT_ROW_BOUNDS = getTextRowBounds();

type CanvasLayout = {
  readonly padding: number;
  readonly gap: number;
  readonly cellWidth: number;
  readonly cellHeight: number;
};

function getCanvasLayout(options: {
  readonly containerWidth: number;
  readonly containerHeight: number;
}): CanvasLayout {
  const padding = 8;
  const gap = 1;
  const cellWidth =
    (options.containerWidth - padding * 2 - gap * (GRID_COLS - 1)) / GRID_COLS;
  const cellHeight =
    (options.containerHeight - padding * 2 - gap * (GRID_ROWS - 1)) / GRID_ROWS;

  return { padding, gap, cellWidth, cellHeight };
}

function syncCanvasToContainer(options: {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly containerWidth: number;
  readonly containerHeight: number;
  readonly dpr: number;
}): void {
  const { canvas, ctx, containerWidth, containerHeight, dpr } = options;

  // Set canvas size with device pixel ratio for sharpness
  if (
    canvas.width !== containerWidth * dpr ||
    canvas.height !== containerHeight * dpr
  ) {
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    // Resizing resets the transform, so scale is safe here.
    ctx.scale(dpr, dpr);
    return;
  }

  // Keep transform stable across redraws.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawGlowRect(options: {
  readonly ctx: CanvasRenderingContext2D;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly color: string;
  readonly blur: number;
}): void {
  options.ctx.shadowColor = options.color;
  options.ctx.shadowBlur = options.blur;
  options.ctx.fillRect(options.x, options.y, options.width, options.height);
}

function drawWebpGlow(options: {
  readonly ctx: CanvasRenderingContext2D;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly flashIntensity: number;
}): void {
  // Base values
  const baseAlpha = 0.3;
  const baseBlur = 3;

  // Flash peak values
  const peakOuterAlpha = 0.5;
  const peakOuterBlur = 28;
  const peakMiddleAlpha = 0.8;
  const peakMiddleBlur = 14;
  const peakInnerAlpha = 1.0;
  const peakInnerBlur = 6;

  // Outer glow layer (large, soft)
  drawGlowRect({
    ctx: options.ctx,
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    color: accentRgba(peakOuterAlpha * options.flashIntensity),
    blur: peakOuterBlur * options.flashIntensity,
  });

  // Middle glow layer
  drawGlowRect({
    ctx: options.ctx,
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    color: accentRgba(peakMiddleAlpha * options.flashIntensity),
    blur: peakMiddleBlur * options.flashIntensity,
  });

  // Inner bright core (interpolates with base glow)
  drawGlowRect({
    ctx: options.ctx,
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    color: accentRgba(
      baseAlpha + (peakInnerAlpha - baseAlpha) * options.flashIntensity,
    ),
    blur: baseBlur + (peakInnerBlur - baseBlur) * options.flashIntensity,
  });

  options.ctx.shadowBlur = 0;
}

/**
 * Returns a 0..1 decode progress for a block.
 *
 * - Only active within the text band.
 * - Uses a ramp so when the beam reaches the row (distanceFromScan === 0),
 *   progress is already 1 (fully decoded).
 * - Can force-complete early near the band end.
 */
function getDecodeProgress(options: {
  readonly isInTextBand: boolean;
  readonly isOptimized: boolean;
  readonly hasReachedTextBandEnd: boolean;
  readonly distanceFromScan: number;
}): number {
  if (!options.isInTextBand) {
    return options.isOptimized ? 1 : 0;
  }

  if (options.isOptimized || options.hasReachedTextBandEnd) return 1;

  const ramp = Math.max(DECODE_RAMP_ROWS, 0.001);
  // distanceFromScan = currentScanRow - block.row
  // -ramp => 0, 0 => 1
  const progress = (options.distanceFromScan + ramp) / ramp;
  return clamp01(progress);
}

type PixelDecodeGridProps = {
  readonly scanProgress: number;
  readonly isOptimized: boolean;
  readonly hasStarted: boolean;
};

/**
 * Pixel decode grid component (Canvas-based for performance)
 *
 * Displays a grid of blocks that spell "JPEG" initially,
 * then transform to spell "WebP" as the scan beam passes.
 * Uses Canvas rendering to avoid 448+ DOM nodes.
 */
export function PixelDecodeGrid({
  scanProgress,
  isOptimized,
  hasStarted,
}: PixelDecodeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawRef = useRef<DrawFn>(() => {});

  // Flash animation state
  const prevIsOptimizedRef = useRef(isOptimized);
  const flashStartTimeRef = useRef<number | null>(null);
  const flashProgressRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect when isOptimized transitions to true and trigger flash (dark mode only)
  useEffect(() => {
    if (isOptimized && !prevIsOptimizedRef.current && isDarkModeEnabled()) {
      // Delay to wait for fade-in animation to complete
      delayTimerRef.current = setTimeout(() => {
        flashStartTimeRef.current = performance.now();
        flashProgressRef.current = 0;

        const animateFlash = (now: number): void => {
          const elapsed = now - (flashStartTimeRef.current ?? now);
          const linearProgress = elapsed / FLASH_DURATION_MS;
          const intensity = getFlashIntensityForElapsedMs(elapsed);
          flashProgressRef.current = intensity;

          drawRef.current();

          const shouldContinue =
            linearProgress < 1 ||
            (elapsed < FLASH_DURATION_MS + FLASH_TAIL_DURATION_MS &&
              intensity > FLASH_END_INTENSITY_EPSILON);

          if (shouldContinue) {
            rafIdRef.current = requestAnimationFrame(animateFlash);
          } else {
            flashProgressRef.current = 0;
            drawRef.current();
            flashStartTimeRef.current = null;
          }
        };

        rafIdRef.current = requestAnimationFrame(animateFlash);
      }, FLASH_DELAY_MS);
    }
    prevIsOptimizedRef.current = isOptimized;

    return () => {
      if (delayTimerRef.current !== null) {
        clearTimeout(delayTimerRef.current);
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isOptimized]);

  // Draw function using useCallback for stability
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    if (containerWidth <= 0 || containerHeight <= 0) return;
    const dpr = window.devicePixelRatio || 1;

    syncCanvasToContainer({
      canvas,
      ctx,
      containerWidth,
      containerHeight,
      dpr,
    });

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    const layout = getCanvasLayout({ containerWidth, containerHeight });

    // Calculate current scan row
    const currentScanRow = (scanProgress / 100) * GRID_ROWS;
    const textBounds = TEXT_ROW_BOUNDS;
    const flashIntensity = flashProgressRef.current;

    // Draw each block
    for (const block of PIXEL_BLOCKS) {
      const x = layout.padding + block.col * (layout.cellWidth + layout.gap);
      const y = layout.padding + block.row * (layout.cellHeight + layout.gap);

      // Calculate visual state
      const distanceFromScan = currentScanRow - block.row;
      const isInTextBand =
        block.row >= textBounds.minRow && block.row <= textBounds.maxRow;
      const hasReachedTextBandEnd =
        currentScanRow >= textBounds.maxRow - DECODE_END_EARLY_ROWS;

      // Only apply decode behavior within the text height band.
      // Timing: by the time the beam reaches the row, it is fully decoded.
      const decodeProgress = getDecodeProgress({
        isInTextBand,
        isOptimized,
        hasReachedTextBandEnd,
        distanceFromScan,
      });
      const decoded = decodeProgress >= 1;
      const scrambling =
        hasStarted &&
        !isOptimized &&
        !decoded &&
        isInTextBand &&
        Math.abs(distanceFromScan) < SCRAMBLE_RANGE;
      const showJpeg = !scrambling && !decoded;
      const showScrambleBlock = scrambling && block.isScramblePattern;

      const opacity = decodeProgress;
      const scale = decodeProgress;

      // Draw JPEG block (fading out)
      if (showJpeg || opacity < 0.99) {
        const jpegOpacity = showJpeg
          ? block.jpegOpacity
          : block.jpegOpacity * (1 - opacity);
        if (jpegOpacity > 0.01) {
          ctx.fillStyle = accentRgba(jpegOpacity);
          ctx.fillRect(x, y, layout.cellWidth, layout.cellHeight);

          // Glow for JPEG pattern blocks
          if (block.isJpegPattern && jpegOpacity > 0.3) {
            drawGlowRect({
              ctx,
              x,
              y,
              width: layout.cellWidth,
              height: layout.cellHeight,
              color: accentRgba(0.4),
              blur: 4,
            });
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw scramble block
      if (showScrambleBlock) {
        ctx.fillStyle = accentRgba(0.5);
        ctx.fillRect(x, y, layout.cellWidth, layout.cellHeight);
      }

      // Draw WebP block (scaling in)
      if (scale > 0.01) {
        const webpOpacity = block.webpOpacity * opacity;
        const scaledWidth = layout.cellWidth * scale;
        const scaledHeight = layout.cellHeight * scale;
        const offsetX = (layout.cellWidth - scaledWidth) / 2;
        const offsetY = (layout.cellHeight - scaledHeight) / 2;

        ctx.fillStyle = accentRgba(webpOpacity);
        ctx.fillRect(x + offsetX, y + offsetY, scaledWidth, scaledHeight);

        // Glow for WebP pattern blocks (smoothly enhanced during flash)
        if (block.isWebpPattern && webpOpacity > 0.3) {
          drawWebpGlow({
            ctx,
            x: x + offsetX,
            y: y + offsetY,
            width: scaledWidth,
            height: scaledHeight,
            flashIntensity,
          });
        }
      }
    }

    // Draw scan line glow
    if (!isOptimized && scanProgress < 100) {
      const isScanInTextBand =
        currentScanRow >= textBounds.minRow &&
        currentScanRow <= textBounds.maxRow;
      if (!isScanInTextBand) return;

      const scanY = (scanProgress / 100) * containerHeight;
      const glow = SCAN_GLOW_HALF_THICKNESS_PX;
      const gradient = ctx.createLinearGradient(
        0,
        scanY - glow,
        0,
        scanY + glow,
      );
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(0.5, accentRgba(0.2));
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;

      // Clamp glow drawing into the text band's vertical area
      const bandTop =
        layout.padding + textBounds.minRow * (layout.cellHeight + layout.gap);
      const bandBottom =
        layout.padding +
        (textBounds.maxRow + 1) * layout.cellHeight +
        textBounds.maxRow * layout.gap;

      const rectTop = scanY - glow;
      const rectBottom = scanY + glow;
      const clampedTop = Math.max(rectTop, bandTop);
      const clampedBottom = Math.min(rectBottom, bandBottom);

      const height = clampedBottom - clampedTop;
      if (height <= 0) return;
      ctx.fillRect(0, clampedTop, containerWidth, height);
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
