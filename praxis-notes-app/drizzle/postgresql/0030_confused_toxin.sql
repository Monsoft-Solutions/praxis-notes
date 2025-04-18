ALTER TABLE "client_session_abc_entry" DROP CONSTRAINT "client_session_abc_entry_behavior_id_behavior_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" DROP CONSTRAINT "client_session_abc_entry_intervention_id_interventions_id_fk";
--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" DROP COLUMN "behavior_id";--> statement-breakpoint
ALTER TABLE "client_session_abc_entry" DROP COLUMN "intervention_id";