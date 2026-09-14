/**
 * Each die's "rolling" sprite-swap animation runs for its own random
 * duration in this range, so a hand doesn't all stop at once.
 */
export const ROLL_MIN_DURATION_MS = 500;
export const ROLL_MAX_DURATION_MS = 2000;

/** How often a rolling die's face/tumble updates at the very start of its roll. */
export const ROLL_TICK_INTERVAL_MS = 100;

/** How far apart updates have drifted by the time a die is about to settle. */
export const ROLL_TICK_MAX_INTERVAL_MS = 340;

/** Extra pause after every die has settled, before the result banner appears. */
export const RESULT_REVEAL_MIN_DELAY_MS = 250;
export const RESULT_REVEAL_MAX_DELAY_MS = 500;

/** Picks a random roll-animation duration within the configured range. */
export function randomRollDuration(): number {
  return ROLL_MIN_DURATION_MS + Math.random() * (ROLL_MAX_DURATION_MS - ROLL_MIN_DURATION_MS);
}

/** Picks a random pause before the result banner appears once every die has settled. */
export function randomRevealDelay(): number {
  return RESULT_REVEAL_MIN_DELAY_MS + Math.random() * (RESULT_REVEAL_MAX_DELAY_MS - RESULT_REVEAL_MIN_DELAY_MS);
}

/**
 * The delay before a rolling die's next tick, given how far through its own
 * roll duration it is (0 = just started, 1 = about to settle). Ticks start
 * fast and space out as the die "decelerates" toward settling.
 */
export function tickIntervalForProgress(progress: number): number {
  return ROLL_TICK_INTERVAL_MS + progress * (ROLL_TICK_MAX_INTERVAL_MS - ROLL_TICK_INTERVAL_MS);
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

const MAX_TUMBLE_X = 55;
const MAX_TUMBLE_Y = 65;
const MAX_TUMBLE_ROT = 360;

/**
 * A random offset + rotation for the CSS "tumble" effect while a die is
 * mid-roll. `intensity` (0..1) scales the range down — pass a smaller value
 * as the die approaches settling to make the tumble "decelerate".
 */
export function randomTumble(intensity: number = 1): DieTumble {
  return {
    x: (Math.random() * 2 - 1) * MAX_TUMBLE_X * intensity,
    y: (Math.random() * 2 - 1) * MAX_TUMBLE_Y * intensity,
    rot: (Math.random() * 2 - 1) * MAX_TUMBLE_ROT * intensity,
  };
}
