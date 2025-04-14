CREATE TABLE "client_session_environmental_change" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"client_session_id" char(36) NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_session_environmental_change" ADD CONSTRAINT "client_session_environmental_change_client_session_id_client_session_id_fk" FOREIGN KEY ("client_session_id") REFERENCES "public"."client_session"("id") ON DELETE no action ON UPDATE no action;