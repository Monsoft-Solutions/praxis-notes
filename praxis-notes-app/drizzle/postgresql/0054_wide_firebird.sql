CREATE TABLE "client_session_reinforcer" (
	"client_session_id" char(36),
	"reinforcer_id" char(36),
	CONSTRAINT "client_session_reinforcer_client_session_id_reinforcer_id_pk" PRIMARY KEY("client_session_id","reinforcer_id")
);
--> statement-breakpoint
ALTER TABLE "client_session_reinforcer" ADD CONSTRAINT "client_session_reinforcer_client_session_id_client_session_id_fk" FOREIGN KEY ("client_session_id") REFERENCES "public"."client_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_session_reinforcer" ADD CONSTRAINT "client_session_reinforcer_reinforcer_id_reinforcer_id_fk" FOREIGN KEY ("reinforcer_id") REFERENCES "public"."reinforcer"("id") ON DELETE cascade ON UPDATE cascade;