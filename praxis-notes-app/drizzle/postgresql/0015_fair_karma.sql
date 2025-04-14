ALTER TABLE "session_abc" RENAME TO "client_session_abc_entry";--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" DROP CONSTRAINT "session_abc_client_session_id_client_session_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" DROP CONSTRAINT "session_abc_antecedent_id_antecedent_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" DROP CONSTRAINT "session_abc_behavior_id_behavior_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" DROP CONSTRAINT "session_abc_intervention_id_interventions_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" ADD CONSTRAINT "client_session_abc_entry_client_session_id_client_session_id_fk" FOREIGN KEY ("client_session_id") REFERENCES "public"."client_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" ADD CONSTRAINT "client_session_abc_entry_antecedent_id_antecedent_id_fk" FOREIGN KEY ("antecedent_id") REFERENCES "public"."antecedent"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" ADD CONSTRAINT "client_session_abc_entry_behavior_id_behavior_id_fk" FOREIGN KEY ("behavior_id") REFERENCES "public"."behavior"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" ADD CONSTRAINT "client_session_abc_entry_intervention_id_interventions_id_fk" FOREIGN KEY ("intervention_id") REFERENCES "public"."interventions"("id") ON DELETE no action ON UPDATE no action;