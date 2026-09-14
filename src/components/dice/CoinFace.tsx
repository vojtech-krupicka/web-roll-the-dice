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
        style={
          color
            ? { fill: color, stroke: "rgba(0,0,0,0.25)" }
            : { fill: "var(--color-panel-inset)", stroke: "var(--color-border-strong)" }
        }
      />
      <circle
        cx="50"
        cy="50"
        r="36"
        strokeWidth="2"
        className="fill-none"
        style={{ stroke: color ? "rgba(255,255,255,0.6)" : "var(--color-border-strong)" }}
      />
      <text
        x="50"
        y="52"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 34, fill: color ? "white" : "var(--color-muted)" }}
        className="font-bold"
      >
        {heads ? "H" : "T"}
      </text>
    </svg>
  );
}
