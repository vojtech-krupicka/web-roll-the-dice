CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" varchar(5) NOT NULL,
	"name" text NOT NULL,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_modified" timestamp with time zone DEFAULT now() NOT NULL,
	"current_player_id" integer,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "games_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_current_player_id_players_id_fk" FOREIGN KEY ("current_player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;