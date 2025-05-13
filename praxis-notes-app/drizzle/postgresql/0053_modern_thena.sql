CREATE TABLE "client_session_reinforcer" (
	"client_session_id" char(36),
	"reinforcer_id" char(36),
	CONSTRAINT "client_session_reinforcer_client_session_id_reinforcer_id_pk" PRIMARY KEY("client_session_id","reinforcer_id")
);
--> statement-breakpoint
CREATE TABLE "reinforcer" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"organization_id" char(36),
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_session_replacement_program_entry" ADD COLUMN "linked_abc_entry_id" char(36);--> statement-breakpoint
ALTER TABLE "client_session_reinforcer" ADD CONSTRAINT "client_session_reinforcer_client_session_id_client_session_id_fk" FOREIGN KEY ("client_session_id") REFERENCES "public"."client_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_reinforcer" ADD CONSTRAINT "client_session_reinforcer_reinforcer_id_reinforcer_id_fk" FOREIGN KEY ("reinforcer_id") REFERENCES "public"."reinforcer"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "reinforcer" ADD CONSTRAINT "reinforcer_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_replacement_program_entry" ADD CONSTRAINT "client_session_replacement_program_entry_linked_abc_entry_id_client_session_abc_entry_id_fk" FOREIGN KEY ("linked_abc_entry_id") REFERENCES "public"."client_session_abc_entry"("id") ON DELETE set null ON UPDATE no action;