import {
  type AnyPgColumn,
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import type { HandEntry } from "@/lib/hand";
import { DEFAULT_PLAYER_COLOR, DEFAULT_PLAYER_ICON } from "@/lib/playerColors";

export type GameSettings = {
  mode?: "2d" | "3d";
};

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  hash: varchar("hash", { length: 5 }).notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastModified: timestamp("last_modified", { withTimezone: true }).notNull().defaultNow(),
  // References players.id — declared as a thunk since players is defined
  // below; set null if that player is ever removed independently.
  currentPlayerId: integer("current_player_id").references(
    (): AnyPgColumn => players.id,
    { onDelete: "set null" },
  ),
  settings: jsonb("settings").$type<GameSettings>().notNull().default({}),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default(DEFAULT_PLAYER_COLOR),
  icon: text("icon").notNull().default(DEFAULT_PLAYER_ICON),
  enabled: boolean("enabled").notNull().default(true),
  // Ordered list of {sides, enabled, count} — same shape as HandEntry[],
  // order preserved since it's a JSON array, not an object.
  currentHand: jsonb("current_hand").$type<HandEntry[]>().notNull().default([]),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type RollData = {
  sum: number;
  /** sides (as a string key) -> the individual values rolled for that type. */
  roll: Record<string, number[]>;
  avg: number;
  median: number;
  min: number;
  max: number;
};

export const rolls = pgTable("rolls", {
  id: serial("id").primaryKey(),
  // Denormalized from players.gameId — avoids a join for "all rolls in this
  // game", and both ids are already known at insert time.
  gameId: integer("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  isValid: boolean("is_valid").notNull().default(true),
  data: jsonb("data").$type<RollData>().notNull(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type Roll = typeof rolls.$inferSelect;
export type NewRoll = typeof rolls.$inferInsert;
