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

type BlockTransitionState = {
  opacity: number;
  scale: number;
};

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
    const textBounds = getTextRowBounds();

    // Draw each block
    for (const block of PIXEL_BLOCKS) {
      const x = padding + block.col * (cellWidth + gap);
      const y = padding + block.row * (cellHeight + gap);

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

      // Get or initialize block transition state
      let state = blockStatesRef.current.get(block.id);
      if (!state) {
        state = { opacity: decodeProgress, scale: decodeProgress };
        blockStatesRef.current.set(block.id, state);
      }

      // Follow the computed progress directly to avoid lag behind the beam.
      state.opacity = decodeProgress;
      state.scale = decodeProgress;

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
      const bandTop = padding + textBounds.minRow * (cellHeight + gap);
      const bandBottom =
        padding +
        (textBounds.maxRow + 1) * cellHeight +
        textBounds.maxRow * gap;

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
