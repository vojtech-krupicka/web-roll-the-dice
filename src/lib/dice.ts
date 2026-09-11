/** Duration of the "rolling" sprite-swap animation, in milliseconds. */
export const ROLL_ANIMATION_DURATION_MS = 500;

/** How often the die face swaps to a random value while rolling. */
export const ROLL_TICK_INTERVAL_MS = 90;

/** Rolls a single six-sided die. */
export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}
