ALTER TABLE "interventions" ALTER COLUMN "created_at" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "interventions" ALTER COLUMN "updated_at" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "client_intervention" ALTER COLUMN "created_at" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "client_intervention" ALTER COLUMN "updated_at" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "client_behavior_intervention" ALTER COLUMN "created_at" SET DATA TYPE bigint;