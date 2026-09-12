import type { HandEntry } from "./hand";
import type { Player } from "./db/schema";

/** Client-facing player shape — trims createdAt/gameId, keeps everything the UI needs. */
export type PlayerSummary = {
  id: number;
  name: string;
  color: string;
  icon: string;
  enabled: boolean;
  order: number;
  currentHand: HandEntry[];
};

export function toPlayerSummary(player: Player): PlayerSummary {
  return {
    id: player.id,
    name: player.name,
    color: player.color,
    icon: player.icon,
    enabled: player.enabled,
    order: player.order,
    currentHand: player.currentHand,
  };
}
