/** Duration of the "rolling" sprite-swap animation, in milliseconds. */
export const ROLL_ANIMATION_DURATION_MS = 500;

/** How often the die face swaps to a random value while rolling. */
export const ROLL_TICK_INTERVAL_MS = 90;

/**
 * Rolls a single die with the given number of sides.
 *
 * d2 is a coin flip and is the one exception to the usual 1..sides range:
 * it returns 0 (tails) or 1 (heads), so summing a hand of coins directly
 * gives you "how many heads".
 */
export function rollDie(sides: number): number {
  if (sides === 2) {
    return Math.floor(Math.random() * 2);
  }
  return Math.floor(Math.random() * sides) + 1;
}

/** Rolls a single six-sided die. */
export function rollD6(): number {
  return rollDie(6);
}
