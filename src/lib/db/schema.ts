import {
  type AnyPgColumn,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
