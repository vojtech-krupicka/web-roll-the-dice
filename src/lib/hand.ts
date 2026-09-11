/** Supported die types. Only d6 for now — more sides will be added later. */
export type DieSides = 6;

export type HandEntry = {
  sides: DieSides;
  /** Whether this die type currently contributes dice to rolls. */
  enabled: boolean;
  /** How many dice of this type are in the hand. Never negative. */
  count: number;
};

export const DEFAULT_HAND: HandEntry[] = [{ sides: 6, enabled: true, count: 1 }];

/** Total dice that will actually be rolled (disabled entries don't count). */
export function activeDiceCount(hand: HandEntry[]): number {
  return hand.reduce((sum, entry) => sum + (entry.enabled ? entry.count : 0), 0);
}

/**
 * Drops enabled entries whose count was decremented to zero — they're gone
 * for good until re-added. Disabled entries are always kept, regardless of
 * count, so re-enabling them later still works.
 */
export function pruneEmptyEnabledEntries(hand: HandEntry[]): HandEntry[] {
  return hand.filter((entry) => !entry.enabled || entry.count > 0);
}

export type DieInstance = {
  key: string;
  sides: DieSides;
};

/** Flattens the hand into individual rollable dice (enabled entries only). */
export function flattenHand(hand: HandEntry[]): DieInstance[] {
  return hand
    .filter((entry) => entry.enabled && entry.count > 0)
    .flatMap((entry) =>
      Array.from({ length: entry.count }, (_, i) => ({
        key: `${entry.sides}-${i}`,
        sides: entry.sides,
      })),
    );
}
