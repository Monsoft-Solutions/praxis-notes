ALTER TABLE "interventions" DROP CONSTRAINT "interventions_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "interventions" DROP CONSTRAINT "interventions_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "interventions" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "interventions" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "interventions" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "interventions" DROP COLUMN "updated_by";