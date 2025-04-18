CREATE TABLE "client_session_abc_entry_behavior" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"client_session_abc_entry_id" char(36),
	"behavior_id" char(36)
);
--> statement-breakpoint
CREATE TABLE "client_session_abc_entry_intervention" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"client_session_abc_entry_id" char(36),
	"intervention_id" char(36)
);
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry_behavior" ADD CONSTRAINT "client_session_abc_entry_behavior_client_session_abc_entry_id_client_session_id_fk" FOREIGN KEY ("client_session_abc_entry_id") REFERENCES "public"."client_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_abc_entry_behavior" ADD CONSTRAINT "client_session_abc_entry_behavior_behavior_id_behavior_id_fk" FOREIGN KEY ("behavior_id") REFERENCES "public"."behavior"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_abc_entry_intervention" ADD CONSTRAINT "client_session_abc_entry_intervention_client_session_abc_entry_id_client_session_id_fk" FOREIGN KEY ("client_session_abc_entry_id") REFERENCES "public"."client_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_abc_entry_intervention" ADD CONSTRAINT "client_session_abc_entry_intervention_intervention_id_interventions_id_fk" FOREIGN KEY ("intervention_id") REFERENCES "public"."interventions"("id") ON DELETE no action ON UPDATE no action;