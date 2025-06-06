CREATE TABLE "conversation_summary" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"session_id" char(36) NOT NULL,
	"summary" text NOT NULL,
	"from_timestamp" bigint NOT NULL,
	"to_timestamp" bigint NOT NULL,
	"original_token_count" integer NOT NULL,
	"summary_token_count" integer NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_message" ADD COLUMN "token_count" integer;--> statement-breakpoint
ALTER TABLE "chat_message" ADD COLUMN "importance_score" integer;--> statement-breakpoint
ALTER TABLE "conversation_summary" ADD CONSTRAINT "conversation_summary_session_id_chat_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_session"("id") ON DELETE no action ON UPDATE no action;