CREATE TABLE "client_session" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"client_id" char(36),
	"user_id" char(36) NOT NULL,
	"session_date" integer NOT NULL,
	"start_time" varchar(10) NOT NULL,
	"end_time" varchar(10) NOT NULL,
	"location" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_session" ADD CONSTRAINT "client_session_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session" ADD CONSTRAINT "client_session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;