ALTER TABLE "client_behavior_intervention" DROP CONSTRAINT "client_behavior_intervention_client_behavior_id_client_behavior_id_fk";
--> statement-breakpoint
ALTER TABLE "client_replacement_program_behaviors" DROP CONSTRAINT "client_replacement_program_behaviors_client_behavior_id_client_behavior_id_fk";
--> statement-breakpoint
ALTER TABLE "client_behavior_intervention" ADD COLUMN "behavior_id" char(36);--> statement-breakpoint
ALTER TABLE "client_replacement_program_behaviors" ADD COLUMN "behavior_id" char(36);--> statement-breakpoint
UPDATE "client_behavior_intervention"
SET "behavior_id" = (
    SELECT "behavior_id"
    FROM "client_behavior"
    WHERE "client_behavior"."id" = "client_behavior_intervention"."client_behavior_id"
);
--> statement-breakpoint
UPDATE "client_replacement_program_behaviors"
SET "behavior_id" = (
    SELECT "behavior_id"
    FROM "client_behavior"
    WHERE "client_behavior"."id" = "client_replacement_program_behaviors"."client_behavior_id"
);
--> statement-breakpoint
ALTER TABLE "client_behavior_intervention" ADD CONSTRAINT "client_behavior_intervention_behavior_id_behavior_id_fk" FOREIGN KEY ("behavior_id") REFERENCES "public"."behavior"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_replacement_program_behaviors" ADD CONSTRAINT "client_replacement_program_behaviors_behavior_id_behavior_id_fk" FOREIGN KEY ("behavior_id") REFERENCES "public"."behavior"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_behavior_intervention" DROP COLUMN "client_behavior_id";--> statement-breakpoint
ALTER TABLE "client_replacement_program_behaviors" DROP COLUMN "client_behavior_id";

--> statement-breakpoint
ALTER TABLE "client_behavior_intervention" ALTER COLUMN "behavior_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "client_replacement_program_behaviors" ALTER COLUMN "behavior_id" SET NOT NULL;
