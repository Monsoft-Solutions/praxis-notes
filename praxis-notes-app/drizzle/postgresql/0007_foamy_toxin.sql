ALTER TABLE "client_replacement_programs" DROP CONSTRAINT "client_replacement_programs_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "client_replacement_programs" ADD COLUMN "replacement_program_id" char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE "client_replacement_programs" ADD CONSTRAINT "client_replacement_programs_replacement_program_id_replacement_programs_id_fk" FOREIGN KEY ("replacement_program_id") REFERENCES "public"."replacement_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_replacement_programs" ADD CONSTRAINT "client_replacement_programs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;