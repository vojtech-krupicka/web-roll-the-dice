type CoinFaceProps = {
  /** 0 = tails, 1 = heads. */
  value: number;
  /** When set, tints the coin in this color instead of the neutral palette. */
  color?: string;
  className?: string;
};

/** A d2 "die" — a coin, showing heads (1) or tails (0). */
export function CoinFace({ value, color, className }: CoinFaceProps) {
  const heads = value === 1;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={heads ? "Coin showing heads" : "Coin showing tails"}
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        strokeWidth="4"
        style={color ? { fill: color, stroke: "rgba(0,0,0,0.25)" } : undefined}
        className={color ? undefined : "fill-white stroke-neutral-300 dark:fill-neutral-800 dark:stroke-neutral-600"}
      />
      <circle
        cx="50"
        cy="50"
        r="36"
        strokeWidth="2"
        style={color ? { stroke: "rgba(255,255,255,0.6)" } : undefined}
        className={color ? "fill-none" : "fill-none stroke-neutral-300 dark:stroke-neutral-600"}
      />
      <text
        x="50"
        y="52"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 34, ...(color ? { fill: "white" } : undefined) }}
        className={color ? "font-bold" : "fill-neutral-900 font-bold dark:fill-neutral-100"}
      >
        {heads ? "H" : "T"}
      </text>
    </svg>
  );
}
