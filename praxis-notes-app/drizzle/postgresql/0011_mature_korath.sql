CREATE TYPE "public"."client_session_valuation" AS ENUM('fair', 'good', 'poor');--> statement-breakpoint
ALTER TABLE "client_session" ALTER COLUMN "client_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "client_session" ADD COLUMN "valuation" "client_session_valuation" NOT NULL;