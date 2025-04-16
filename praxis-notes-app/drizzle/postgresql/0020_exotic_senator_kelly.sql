ALTER TABLE "antecedent" DROP CONSTRAINT "antecedent_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "behavior" DROP CONSTRAINT "behavior_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "client_behavior" DROP CONSTRAINT "client_behavior_behavior_id_behavior_id_fk";
--> statement-breakpoint
ALTER TABLE "interventions" DROP CONSTRAINT "interventions_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "client_behavior_intervention" DROP CONSTRAINT "client_behavior_intervention_client_behavior_id_client_behavior_id_fk";
--> statement-breakpoint
ALTER TABLE "replacement_programs" DROP CONSTRAINT "replacement_programs_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "client_replacement_programs" DROP CONSTRAINT "client_replacement_programs_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "client_replacement_program_behaviors" DROP CONSTRAINT "client_replacement_program_behaviors_client_behavior_id_client_behavior_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session" DROP CONSTRAINT "client_session_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" DROP CONSTRAINT "client_session_abc_entry_client_session_id_client_session_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_participant" DROP CONSTRAINT "client_session_participant_client_session_id_client_session_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_environmental_change" DROP CONSTRAINT "client_session_environmental_change_client_session_id_client_session_id_fk";
--> statement-breakpoint
ALTER TABLE "antecedent" ADD CONSTRAINT "antecedent_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "behavior" ADD CONSTRAINT "behavior_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_behavior" ADD CONSTRAINT "client_behavior_behavior_id_behavior_id_fk" FOREIGN KEY ("behavior_id") REFERENCES "public"."behavior"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_behavior_intervention" ADD CONSTRAINT "client_behavior_intervention_client_behavior_id_client_behavior_id_fk" FOREIGN KEY ("client_behavior_id") REFERENCES "public"."client_behavior"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replacement_programs" ADD CONSTRAINT "replacement_programs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_replacement_programs" ADD CONSTRAINT "client_replacement_programs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_replacement_program_behaviors" ADD CONSTRAINT "client_replacement_program_behaviors_client_behavior_id_client_behavior_id_fk" FOREIGN KEY ("client_behavior_id") REFERENCES "public"."client_behavior"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session" ADD CONSTRAINT "client_session_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" ADD CONSTRAINT "client_session_abc_entry_client_session_id_client_session_id_fk" FOREIGN KEY ("client_session_id") REFERENCES "public"."client_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_participant" ADD CONSTRAINT "client_session_participant_client_session_id_client_session_id_fk" FOREIGN KEY ("client_session_id") REFERENCES "public"."client_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_environmental_change" ADD CONSTRAINT "client_session_environmental_change_client_session_id_client_session_id_fk" FOREIGN KEY ("client_session_id") REFERENCES "public"."client_session"("id") ON DELETE cascade ON UPDATE no action;