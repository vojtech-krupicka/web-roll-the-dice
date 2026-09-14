/**
 * Each die's "rolling" sprite-swap animation runs for its own random
 * duration in this range, so a hand doesn't all stop at once.
 */
export const ROLL_MIN_DURATION_MS = 500;
export const ROLL_MAX_DURATION_MS = 2000;

/** How often a rolling die's face swaps to a random value. */
export const ROLL_TICK_INTERVAL_MS = 90;

/** Picks a random roll-animation duration within the configured range. */
export function randomRollDuration(): number {
  return ROLL_MIN_DURATION_MS + Math.random() * (ROLL_MAX_DURATION_MS - ROLL_MIN_DURATION_MS);
}

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

export type DieTumble = { x: number; y: number; rot: number };

/** Rest position — no offset, no rotation. */
export const DIE_REST_TUMBLE: DieTumble = { x: 0, y: 0, rot: 0 };

/** A small random offset + rotation for the CSS "tumble" effect while a die is mid-roll. */
export function randomTumble(): DieTumble {
  return {
    x: Math.random() * 20 - 10,
    y: Math.random() * 20 - 10,
    rot: Math.random() * 70 - 35,
  };
}
