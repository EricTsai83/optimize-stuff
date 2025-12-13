/** Beam height in pixels */
const BEAM_HEIGHT = 60;

/** Half of beam height - used for offset calculations */
const BEAM_OFFSET = BEAM_HEIGHT / 2;

type ScanBeamProps = {
  readonly position: number;
};

/**
 * Scanning beam effect component.
 */
export function ScanBeam({ position }: ScanBeamProps) {
  return (
    <div
      className="pointer-events-none absolute right-0 left-0"
      style={{
        top: `calc(${BEAM_OFFSET}px + ${position}% - ${(position / 100) * BEAM_OFFSET}px)`,
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
