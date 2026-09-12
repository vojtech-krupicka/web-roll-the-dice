import { eq } from "drizzle-orm";
import { db } from "./client";
import { games, players, type Game } from "./schema";
import { generateGameHash } from "@/lib/gameHash";
import { DEFAULT_HAND } from "@/lib/hand";

const MAX_HASH_ATTEMPTS = 5;

export function findGameByHash(hash: string): Promise<Game | undefined> {
  return db.query.games.findFirst({ where: eq(games.hash, hash) });
}

export function findGameById(id: number): Promise<Game | undefined> {
  return db.query.games.findFirst({ where: eq(games.id, id) });
}

type CreateGameInput = {
  name: string;
  passwordHash: string | null;
};

/** Creates a game with a unique hash and one default player ("Player #1"). */
export async function createGameWithDefaultPlayer({
  name,
  passwordHash,
}: CreateGameInput): Promise<Game> {
  return db.transaction(async (tx) => {
    let game: Game | undefined;

    for (let attempt = 0; attempt < MAX_HASH_ATTEMPTS && !game; attempt++) {
      const hash = generateGameHash();
      const existing = await tx.query.games.findFirst({ where: eq(games.hash, hash) });
      if (existing) continue;

      [game] = await tx.insert(games).values({ hash, name, passwordHash }).returning();
    }

    if (!game) {
      throw new Error("Could not generate a unique game hash — please try again.");
    }

    const [defaultPlayer] = await tx
      .insert(players)
      .values({ gameId: game.id, name: "Player #1", order: 0, currentHand: DEFAULT_HAND })
      .returning();

    [game] = await tx
      .update(games)
      .set({ currentPlayerId: defaultPlayer.id })
      .where(eq(games.id, game.id))
      .returning();

    return game;
  });
}

type UpdateGameInput = {
  id: number;
  name: string;
  /** undefined = leave unchanged, null = clear, string = new hash */
  passwordHash?: string | null;
};

export async function updateGame({ id, name, passwordHash }: UpdateGameInput): Promise<Game> {
  const [updated] = await db
    .update(games)
    .set({
      name,
      lastModified: new Date(),
      ...(passwordHash !== undefined ? { passwordHash } : {}),
    })
    .where(eq(games.id, id))
    .returning();

  return updated;
}

export async function deleteGame(id: number): Promise<void> {
  await db.delete(games).where(eq(games.id, id));
}

export async function updateGameCurrentPlayer(gameId: number, playerId: number): Promise<void> {
  await db
    .update(games)
    .set({ currentPlayerId: playerId, lastModified: new Date() })
    .where(eq(games.id, gameId));
}
