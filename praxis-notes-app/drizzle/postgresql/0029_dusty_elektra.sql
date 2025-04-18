ALTER TABLE "client_session_abc_entry_behavior" DROP CONSTRAINT "client_session_abc_entry_behavior_client_session_abc_entry_id_client_session_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry_intervention" DROP CONSTRAINT "client_session_abc_entry_intervention_client_session_abc_entry_id_client_session_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry_behavior" ADD CONSTRAINT "client_session_abc_entry_behavior_client_session_abc_entry_id_client_session_abc_entry_id_fk" FOREIGN KEY ("client_session_abc_entry_id") REFERENCES "public"."client_session_abc_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_abc_entry_intervention" ADD CONSTRAINT "client_session_abc_entry_intervention_client_session_abc_entry_id_client_session_abc_entry_id_fk" FOREIGN KEY ("client_session_abc_entry_id") REFERENCES "public"."client_session_abc_entry"("id") ON DELETE cascade ON UPDATE no action;