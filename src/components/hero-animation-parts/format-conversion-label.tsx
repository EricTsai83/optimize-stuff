import { cn } from "@/lib/utils";
import { TextDecode } from "@/components/text-decode";

/** Interval between each character starting decode (ms) */
const STAGGER_DELAY = 150;
/** Duration each character stays in scrambling state (ms) */
const SCRAMBLE_DURATION = 30;

type FormatConversionLabelProps = {
  readonly shouldStartDecode: boolean;
};

/**
 * Format conversion label showing .jpeg → .webp transition.
 */
export function FormatConversionLabel({
  shouldStartDecode,
}: FormatConversionLabelProps) {
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
            delay={0}
            showScanLine={true}
            showCursor={false}
            className="text-accent"
          />
        ) : null}
      </span>
    </div>
  );
}
