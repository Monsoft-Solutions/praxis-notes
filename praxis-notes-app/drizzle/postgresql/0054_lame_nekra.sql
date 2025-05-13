ALTER TABLE "public"."client_session_abc_entry" ALTER COLUMN "function" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."client_session_abc_entry_function";--> statement-breakpoint
-- Update the values in the column function to fix the typo
UPDATE "public"."client_session_abc_entry" SET "function" = 'attention' WHERE "function" = 'atention';--> statement-breakpoint
CREATE TYPE "public"."client_session_abc_entry_function" AS ENUM('attention', 'escape', 'sensory', 'tangible');--> statement-breakpoint
ALTER TABLE "public"."client_session_abc_entry" ALTER COLUMN "function" SET DATA TYPE "public"."client_session_abc_entry_function" USING "function"::"public"."client_session_abc_entry_function";