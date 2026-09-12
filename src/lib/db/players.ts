import { asc, eq } from "drizzle-orm";
import { db } from "./client";
import { players, type Player } from "./schema";
import { DEFAULT_HAND, type HandEntry } from "@/lib/hand";

export function listPlayersForGame(gameId: number): Promise<Player[]> {
  return db.query.players.findMany({
    where: eq(players.gameId, gameId),
    orderBy: [asc(players.order)],
  });
}

export function findPlayerById(id: number): Promise<Player | undefined> {
  return db.query.players.findFirst({ where: eq(players.id, id) });
}

type CreatePlayerInput = {
  gameId: number;
  name: string;
  color: string;
  icon: string;
  enabled: boolean;
  order: number;
};

export async function createPlayer(input: CreatePlayerInput): Promise<Player> {
  const [player] = await db
    .insert(players)
    .values({ ...input, currentHand: DEFAULT_HAND })
    .returning();
  return player;
}

type UpdatePlayerInput = {
  name: string;
  color: string;
  icon: string;
  enabled: boolean;
};

export async function updatePlayer(id: number, input: UpdatePlayerInput): Promise<Player> {
  const [updated] = await db.update(players).set(input).where(eq(players.id, id)).returning();
  return updated;
}

export async function updatePlayerHand(id: number, hand: HandEntry[]): Promise<void> {
  await db.update(players).set({ currentHand: hand }).where(eq(players.id, id));
}

/** Rewrites every player's `order` to match its position in `orderedIds`. */
export async function reorderPlayers(orderedIds: number[]): Promise<void> {
  await db.transaction(async (tx) => {
    for (let index = 0; index < orderedIds.length; index++) {
      await tx.update(players).set({ order: index }).where(eq(players.id, orderedIds[index]));
    }
  });
}
