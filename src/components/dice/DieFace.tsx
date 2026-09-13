type DieFaceProps = {
  value: number;
  /** When set, tints the die in this color instead of the neutral palette. */
  color?: string;
  className?: string;
};

const PIP_POSITIONS = {
  TL: [25, 25],
  TR: [75, 25],
  ML: [25, 50],
  MR: [75, 50],
  BL: [25, 75],
  BR: [75, 75],
  C: [50, 50],
} as const;

type PipKey = keyof typeof PIP_POSITIONS;

const FACE_LAYOUT: Record<number, PipKey[]> = {
  1: ["C"],
  2: ["TL", "BR"],
  3: ["TL", "C", "BR"],
  4: ["TL", "TR", "BL", "BR"],
  5: ["TL", "TR", "C", "BL", "BR"],
  6: ["TL", "TR", "ML", "MR", "BL", "BR"],
};

/** A single d6 face, rendered as an SVG pip layout (1–6). */
export function DieFace({ value, color, className }: DieFaceProps) {
  const pips = FACE_LAYOUT[value] ?? [];

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`Die showing ${value}`}
    >
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="16"
        strokeWidth="2"
        style={
          color
            ? { fill: color, stroke: "rgba(0,0,0,0.25)" }
            : { fill: "var(--color-panel-inset)", stroke: "var(--color-border-strong)" }
        }
      />
      {pips.map((key) => {
        const [cx, cy] = PIP_POSITIONS[key];
        return (
          <circle
            key={key}
            cx={cx}
            cy={cy}
            r="8"
            style={{ fill: color ? "white" : "var(--color-muted)" }}
          />
        );
      })}
    </svg>
  );
}
