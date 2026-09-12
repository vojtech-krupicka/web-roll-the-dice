/** Curated palette — saturated enough that white pips/text stay readable on top. */
export const PLAYER_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];

export const PLAYER_ICONS = ["🧑", "👨", "👩"] as const;

export type PlayerIcon = (typeof PLAYER_ICONS)[number];

// Neutral gray for the very first auto-created player — deliberately outside
// the "cool colors" picker palette, so it never collides with a real pick.
export const DEFAULT_PLAYER_COLOR = "#9ca3af";
export const DEFAULT_PLAYER_ICON: PlayerIcon = PLAYER_ICONS[0];

/** A random color from the palette, preferring one no listed player already has. */
export function pickRandomAvailableColor(usedColors: string[]): string {
  const available = PLAYER_COLORS.filter((color) => !usedColors.includes(color));
  const pool = available.length > 0 ? available : PLAYER_COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}
