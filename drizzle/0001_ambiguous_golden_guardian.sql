ALTER TABLE "players" ADD COLUMN "color" text DEFAULT '#3b82f6' NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "icon" text DEFAULT '🧑' NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "current_hand" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;