CREATE TYPE "public"."client_behavior_type" AS ENUM('frequency', 'percentage');--> statement-breakpoint
ALTER TABLE "client_behavior" ADD COLUMN "type" "client_behavior_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "client_behavior" ADD COLUMN "baseline" integer NOT NULL;