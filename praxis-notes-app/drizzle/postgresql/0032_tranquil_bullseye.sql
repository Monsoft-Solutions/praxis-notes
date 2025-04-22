ALTER TABLE "replacement_programs" DROP CONSTRAINT "replacement_programs_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "replacement_programs" DROP CONSTRAINT "replacement_programs_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "replacement_programs" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "replacement_programs" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "replacement_programs" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "replacement_programs" DROP COLUMN "updated_by";--> statement-breakpoint
ALTER TABLE "client_replacement_programs" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "client_replacement_programs" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "client_replacement_program_behaviors" DROP COLUMN "created_at";