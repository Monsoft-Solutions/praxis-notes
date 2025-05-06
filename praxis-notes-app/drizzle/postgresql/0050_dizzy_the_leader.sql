CREATE TABLE "chat_suggested_question" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"session_id" char(36) NOT NULL,
	"question_text" varchar(255) NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_suggested_question" ADD CONSTRAINT "chat_suggested_question_session_id_chat_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_session"("id") ON DELETE no action ON UPDATE no action;