import type { Roll, RollData } from "./db/schema";

export type { RollData };

/** Client-facing roll shape — same fields as the DB row. */
export type RollSummary = {
  id: number;
  playerId: number;
  createdAt: Date;
  isValid: boolean;
  data: RollData;
};

export function toRollSummary(roll: Roll): RollSummary {
  return {
    id: roll.id,
    playerId: roll.playerId,
    createdAt: roll.createdAt,
    isValid: roll.isValid,
    data: roll.data,
  };
}

type RollInput = { sides: number; value: number };

/** Computes sum/avg/median/min/max plus the per-type breakdown for a finished roll. */
export function computeRollData(entries: RollInput[]): RollData {
  const roll: Record<string, number[]> = {};
  entries.forEach(({ sides, value }) => {
    const key = String(sides);
    (roll[key] ??= []).push(value);
  });

  const values = entries.map((entry) => entry.value);
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((total, value) => total + value, 0);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = sum / values.length;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  return { sum, roll, avg, median, min, max };
}

/** Formats a stat value: integers print bare, non-integers get 2 decimal places. */
export function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
