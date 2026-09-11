type NumberDieFaceProps = {
  sides: number;
  value: number;
  className?: string;
};

/**
 * A die face for any non-d6, non-coin type (d4/d8/d10/d12/d20/d100) —
 * physical dice this size print the rolled number rather than pips.
 */
export function NumberDieFace({ sides, value, className }: NumberDieFaceProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`d${sides} showing ${value}`}
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
      <text
        x="50"
        y="52"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: sides >= 100 ? 28 : 38 }}
        className="fill-neutral-900 font-bold tabular-nums dark:fill-neutral-100"
      >
        {value}
      </text>
    </svg>
  );
}
