ALTER TABLE "client_session_abc_entry" RENAME COLUMN "client_behavior_id" TO "behavior_id";--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" RENAME COLUMN "client_intervention_id" TO "intervention_id";--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" DROP CONSTRAINT "client_session_abc_entry_client_behavior_id_client_behavior_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" DROP CONSTRAINT "client_session_abc_entry_client_intervention_id_client_intervention_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" ADD CONSTRAINT "client_session_abc_entry_behavior_id_behavior_id_fk" FOREIGN KEY ("behavior_id") REFERENCES "public"."behavior"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" ADD CONSTRAINT "client_session_abc_entry_intervention_id_interventions_id_fk" FOREIGN KEY ("intervention_id") REFERENCES "public"."interventions"("id") ON DELETE no action ON UPDATE no action;