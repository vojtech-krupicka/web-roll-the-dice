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

export const DEFAULT_PLAYER_COLOR: PlayerColor = PLAYER_COLORS[5];
export const DEFAULT_PLAYER_ICON: PlayerIcon = PLAYER_ICONS[0];
