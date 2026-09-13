type NumberDieFaceProps = {
  sides: number;
  value: number;
  /** When set, tints the die in this color instead of the neutral palette. */
  color?: string;
  className?: string;
};

/**
 * Rough 2D silhouette for each polyhedron, so dice are recognizable by
 * shape alone (not just the printed number): d4 triangle, d8 diamond
 * (octahedron edge-on), d10 kite, d12 pentagon, d20 hexagon, d100 octagon.
 */
const SHAPE_POINTS: Record<number, string> = {
  4: "50,8 10,88 90,88",
  8: "50,6 94,50 50,94 6,50",
  10: "50,10 78,42 50,94 22,42",
  12: "50,6 91.8,36.4 75.9,85.6 24.1,85.6 8.2,36.4",
  20: "50,4 89.8,27 89.8,73 50,96 10.2,73 10.2,27",
  100: "67.6,7.5 92.5,32.4 92.5,67.6 67.6,92.5 32.4,92.5 7.5,67.6 7.5,32.4 32.4,7.5",
};

// Most shapes read fine with the number centered at y=50; a couple of
// asymmetric ones (like the d4 triangle) need the label nudged to sit in
// the shape's visual center instead of its bounding-box center.
const LABEL_Y: Record<number, number> = {
  4: 63,
};

/**
 * A die face for any non-d6, non-coin type (d4/d8/d10/d12/d20/d100) —
 * shaped like the die it represents, with the rolled number printed on it.
 */
export function NumberDieFace({ sides, value, color, className }: NumberDieFaceProps) {
  const points = SHAPE_POINTS[sides];
  const labelY = LABEL_Y[sides] ?? 52;
  const shapeStyle = color
    ? { fill: color, stroke: "rgba(0,0,0,0.25)" }
    : { fill: "var(--color-panel-inset)", stroke: "var(--color-border-strong)" };

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`d${sides} showing ${value}`}
    >
      {points ? (
        <polygon points={points} strokeWidth="2" strokeLinejoin="round" style={shapeStyle} />
      ) : (
        <rect x="4" y="4" width="92" height="92" rx="16" strokeWidth="2" style={shapeStyle} />
      )}
      <text
        x="50"
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: sides >= 100 ? 26 : 32, fill: color ? "white" : "var(--color-muted)" }}
        className="font-bold tabular-nums"
      >
        {value}
      </text>
    </svg>
  );
}
