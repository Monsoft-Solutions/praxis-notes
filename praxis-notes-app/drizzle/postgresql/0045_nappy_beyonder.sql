CREATE TYPE "public"."user_lang" AS ENUM('en', 'es');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "language" "user_lang" DEFAULT 'en';