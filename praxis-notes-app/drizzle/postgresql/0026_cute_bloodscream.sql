ALTER TABLE "client_session_abc_entry" RENAME COLUMN "behavior_id" TO "client_behavior_id";--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" RENAME COLUMN "intervention_id" TO "client_intervention_id";--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" DROP CONSTRAINT "client_session_abc_entry_behavior_id_behavior_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" DROP CONSTRAINT "client_session_abc_entry_intervention_id_interventions_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" ADD CONSTRAINT "client_session_abc_entry_client_behavior_id_client_behavior_id_fk" FOREIGN KEY ("client_behavior_id") REFERENCES "public"."client_behavior"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" ADD CONSTRAINT "client_session_abc_entry_client_intervention_id_client_intervention_id_fk" FOREIGN KEY ("client_intervention_id") REFERENCES "public"."client_intervention"("id") ON DELETE no action ON UPDATE no action;