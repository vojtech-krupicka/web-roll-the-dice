"use server";

import {
  createGameWithDefaultPlayer,
  deleteGame,
  findGameByHash,
  updateGame,
  updateGameCurrentPlayer,
} from "@/lib/db/games";
import {
  createPlayer,
  listPlayersForGame,
  reorderPlayers,
  updatePlayer,
  updatePlayerHand,
} from "@/lib/db/players";
import { createRoll, setRollValidity } from "@/lib/db/rolls";
import type { HandEntry } from "@/lib/hand";
import { hashPassword, verifyPassword } from "@/lib/password";
import { toPlayerSummary, type PlayerSummary } from "@/lib/players";
import { toRollSummary, type RollData, type RollSummary } from "@/lib/rolls";
import { lockGame, unlockGame } from "@/lib/session";

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

// ---- Home page: join / create ----

export async function checkGameAction(
  hash: string,
): Promise<ActionResult<{ hasPassword: boolean }>> {
  const game = await findGameByHash(hash.trim().toLowerCase());
  if (!game) return { ok: false, error: "No game found with that hash." };
  return { ok: true, data: { hasPassword: game.passwordHash !== null } };
}

export async function joinGameWithPasswordAction(
  hash: string,
  password: string,
): Promise<ActionResult> {
  const game = await findGameByHash(hash.trim().toLowerCase());
  if (!game) return { ok: false, error: "No game found with that hash." };
  if (!game.passwordHash) return { ok: true, data: undefined };

  const valid = await verifyPassword(password, game.passwordHash);
  if (!valid) return { ok: false, error: "Incorrect password." };

  await unlockGame(game.id);
  return { ok: true, data: undefined };
}

export async function createGameAction(
  name: string,
  password: string,
  repeatPassword: string,
): Promise<ActionResult<{ hash: string }>> {
  const trimmedName = name.trim();
  if (!trimmedName) return { ok: false, error: "Give your game a name." };
  if (password !== repeatPassword) return { ok: false, error: "Passwords don't match." };

  const passwordHash = password ? await hashPassword(password) : null;
  const game = await createGameWithDefaultPlayer({ name: trimmedName, passwordHash });
  await unlockGame(game.id);

  return { ok: true, data: { hash: game.hash } };
}

// ---- Game page: edit / delete / leave ----

export async function updateGameAction(
  hash: string,
  input: { name: string; currentPassword: string; newPassword: string; repeatNewPassword: string },
): Promise<ActionResult> {
  const game = await findGameByHash(hash);
  if (!game) return { ok: false, error: "Game not found." };

  const trimmedName = input.name.trim();
  if (!trimmedName) return { ok: false, error: "Give your game a name." };

  let passwordHash: string | null | undefined;

  if (input.newPassword || input.repeatNewPassword) {
    if (game.passwordHash) {
      const valid = await verifyPassword(input.currentPassword, game.passwordHash);
      if (!valid) return { ok: false, error: "Current password is incorrect." };
    }
    if (input.newPassword !== input.repeatNewPassword) {
      return { ok: false, error: "New passwords don't match." };
    }
    passwordHash = await hashPassword(input.newPassword);
  }

  await updateGame({ id: game.id, name: trimmedName, passwordHash });
  return { ok: true, data: undefined };
}

export async function deleteGameAction(hash: string, password: string): Promise<ActionResult> {
  const game = await findGameByHash(hash);
  if (!game) return { ok: false, error: "Game not found." };

  if (game.passwordHash) {
    const valid = await verifyPassword(password, game.passwordHash);
    if (!valid) return { ok: false, error: "Incorrect password." };
  }

  await deleteGame(game.id);
  await lockGame(game.id);
  return { ok: true, data: undefined };
}

export async function leaveGameAction(hash: string): Promise<ActionResult> {
  const game = await findGameByHash(hash);
  if (game) await lockGame(game.id);
  return { ok: true, data: undefined };
}

// ---- Players ----

type PlayerFormInput = { name: string; color: string; icon: string; enabled: boolean };

export async function addPlayerAction(
  hash: string,
  input: PlayerFormInput,
): Promise<ActionResult<{ player: PlayerSummary }>> {
  const game = await findGameByHash(hash);
  if (!game) return { ok: false, error: "Game not found." };

  const trimmedName = input.name.trim();
  if (!trimmedName) return { ok: false, error: "Give the player a name." };

  const existing = await listPlayersForGame(game.id);
  const player = await createPlayer({
    gameId: game.id,
    name: trimmedName,
    color: input.color,
    icon: input.icon,
    enabled: input.enabled,
    order: existing.length,
  });

  return { ok: true, data: { player: toPlayerSummary(player) } };
}

export async function updatePlayerAction(
  playerId: number,
  input: PlayerFormInput,
): Promise<ActionResult> {
  const trimmedName = input.name.trim();
  if (!trimmedName) return { ok: false, error: "Give the player a name." };

  await updatePlayer(playerId, { ...input, name: trimmedName });
  return { ok: true, data: undefined };
}

export async function reorderPlayersAction(orderedIds: number[]): Promise<ActionResult> {
  await reorderPlayers(orderedIds);
  return { ok: true, data: undefined };
}

export async function setCurrentPlayerAction(hash: string, playerId: number): Promise<ActionResult> {
  const game = await findGameByHash(hash);
  if (!game) return { ok: false, error: "Game not found." };

  await updateGameCurrentPlayer(game.id, playerId);
  return { ok: true, data: undefined };
}

export async function updatePlayerHandAction(
  playerId: number,
  hand: HandEntry[],
): Promise<ActionResult> {
  await updatePlayerHand(playerId, hand);
  return { ok: true, data: undefined };
}

// ---- Roll history ----

export async function recordRollAction(
  hash: string,
  playerId: number,
  data: RollData,
): Promise<ActionResult<{ roll: RollSummary }>> {
  const game = await findGameByHash(hash);
  if (!game) return { ok: false, error: "Game not found." };

  const roll = await createRoll({ gameId: game.id, playerId, data });
  return { ok: true, data: { roll: toRollSummary(roll) } };
}

export async function setRollValidityAction(rollId: number, isValid: boolean): Promise<ActionResult> {
  await setRollValidity(rollId, isValid);
  return { ok: true, data: undefined };
}
