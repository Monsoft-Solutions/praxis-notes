CREATE TYPE "public"."client_session_replacement_program_entry_response" AS ENUM('expected', 'exceeded', 'delayed');--> statement-breakpoint
CREATE TABLE "teaching_procedure" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_type" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompting_procedure" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_session_replacement_program_entry" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"client_session_id" char(36) NOT NULL,
	"replacement_program_id" char(36) NOT NULL,
	"teaching_procedure_id" char(36),
	"prompting_procedure_id" char(36),
	"client_response" "client_session_replacement_program_entry_response",
	"progress" integer
);
--> statement-breakpoint
CREATE TABLE "client_session_replacement_program_entry_prompt_type" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"client_session_replacement_program_entry_id" char(36),
	"prompt_type_id" char(36)
);
--> statement-breakpoint
ALTER TABLE "client_session_replacement_program_entry" ADD CONSTRAINT "client_session_replacement_program_entry_client_session_id_client_session_id_fk" FOREIGN KEY ("client_session_id") REFERENCES "public"."client_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_replacement_program_entry" ADD CONSTRAINT "client_session_replacement_program_entry_replacement_program_id_replacement_programs_id_fk" FOREIGN KEY ("replacement_program_id") REFERENCES "public"."replacement_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_replacement_program_entry" ADD CONSTRAINT "client_session_replacement_program_entry_teaching_procedure_id_teaching_procedure_id_fk" FOREIGN KEY ("teaching_procedure_id") REFERENCES "public"."teaching_procedure"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_replacement_program_entry" ADD CONSTRAINT "client_session_replacement_program_entry_prompting_procedure_id_prompting_procedure_id_fk" FOREIGN KEY ("prompting_procedure_id") REFERENCES "public"."prompting_procedure"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_replacement_program_entry_prompt_type" ADD CONSTRAINT "client_session_replacement_program_entry_prompt_type_client_session_replacement_program_entry_id_client_session_replacement_program_entry_id_fk" FOREIGN KEY ("client_session_replacement_program_entry_id") REFERENCES "public"."client_session_replacement_program_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_replacement_program_entry_prompt_type" ADD CONSTRAINT "client_session_replacement_program_entry_prompt_type_prompt_type_id_prompt_type_id_fk" FOREIGN KEY ("prompt_type_id") REFERENCES "public"."prompt_type"("id") ON DELETE no action ON UPDATE no action;