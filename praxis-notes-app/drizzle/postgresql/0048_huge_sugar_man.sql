CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "gender" "gender";