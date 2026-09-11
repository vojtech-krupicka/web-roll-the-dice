type DieFaceProps = {
  value: number;
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
export function DieFace({ value, className }: DieFaceProps) {
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
        className="fill-white stroke-neutral-300 dark:fill-neutral-800 dark:stroke-neutral-600"
      />
      {pips.map((key) => {
        const [cx, cy] = PIP_POSITIONS[key];
        return (
          <circle
            key={key}
            cx={cx}
            cy={cy}
            r="8"
            className="fill-neutral-900 dark:fill-neutral-100"
          />
        );
      })}
    </svg>
  );
}
