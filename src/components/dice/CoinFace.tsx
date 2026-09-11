type CoinFaceProps = {
  /** 0 = tails, 1 = heads. */
  value: number;
  className?: string;
};

/** A d2 "die" — a coin, showing heads (1) or tails (0). */
export function CoinFace({ value, className }: CoinFaceProps) {
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
        className="fill-amber-100 stroke-amber-500 dark:fill-amber-900 dark:stroke-amber-600"
      />
      <circle
        cx="50"
        cy="50"
        r="36"
        strokeWidth="2"
        className="fill-none stroke-amber-400 dark:stroke-amber-700"
      />
      <text
        x="50"
        y="52"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 34 }}
        className="fill-amber-900 font-bold dark:fill-amber-100"
      >
        {heads ? "H" : "T"}
      </text>
    </svg>
  );
}
