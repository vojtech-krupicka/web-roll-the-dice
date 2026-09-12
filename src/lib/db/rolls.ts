import { desc, eq } from "drizzle-orm";
import { db } from "./client";
import { rolls, type Roll, type RollData } from "./schema";

export function listRollsForGame(gameId: number): Promise<Roll[]> {
  return db.query.rolls.findMany({
    where: eq(rolls.gameId, gameId),
    orderBy: [desc(rolls.createdAt)],
  });
}

type CreateRollInput = {
  gameId: number;
  playerId: number;
  data: RollData;
};

export async function createRoll(input: CreateRollInput): Promise<Roll> {
  const [roll] = await db.insert(rolls).values(input).returning();
  return roll;
}

export async function setRollValidity(id: number, isValid: boolean): Promise<void> {
  await db.update(rolls).set({ isValid }).where(eq(rolls.id, id));
}
