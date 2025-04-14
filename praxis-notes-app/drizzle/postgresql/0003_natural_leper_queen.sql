CREATE TABLE "session_abc" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"client_session_id" char(36),
	"antecedent_id" char(36),
	"behavior_id" char(36),
	"intervention_id" char(36)
);
--> statement-breakpoint
ALTER TABLE "session_abc" ADD CONSTRAINT "session_abc_client_session_id_client_session_id_fk" FOREIGN KEY ("client_session_id") REFERENCES "public"."client_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_abc" ADD CONSTRAINT "session_abc_antecedent_id_antecedent_id_fk" FOREIGN KEY ("antecedent_id") REFERENCES "public"."antecedent"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_abc" ADD CONSTRAINT "session_abc_behavior_id_behavior_id_fk" FOREIGN KEY ("behavior_id") REFERENCES "public"."behavior"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_abc" ADD CONSTRAINT "session_abc_intervention_id_interventions_id_fk" FOREIGN KEY ("intervention_id") REFERENCES "public"."interventions"("id") ON DELETE no action ON UPDATE no action;