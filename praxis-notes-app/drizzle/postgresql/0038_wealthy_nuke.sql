ALTER TABLE "client_behavior_intervention" DROP CONSTRAINT "client_behavior_intervention_client_behavior_id_client_behavior_id_fk";
--> statement-breakpoint
ALTER TABLE "client_replacement_program_behaviors" DROP CONSTRAINT "client_replacement_program_behaviors_client_behavior_id_client_behavior_id_fk";
--> statement-breakpoint
ALTER TABLE "client_behavior_intervention" ADD CONSTRAINT "client_behavior_intervention_client_behavior_id_client_behavior_id_fk" FOREIGN KEY ("client_behavior_id") REFERENCES "public"."client_behavior"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_replacement_program_behaviors" ADD CONSTRAINT "client_replacement_program_behaviors_client_behavior_id_client_behavior_id_fk" FOREIGN KEY ("client_behavior_id") REFERENCES "public"."client_behavior"("id") ON DELETE cascade ON UPDATE no action;