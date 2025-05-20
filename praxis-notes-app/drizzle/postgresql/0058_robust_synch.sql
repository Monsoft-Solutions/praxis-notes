CREATE TABLE "chat_message_attachment" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"message_id" char(36) NOT NULL,
	"file_id" char(36) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_message_attachment" ADD CONSTRAINT "chat_message_attachment_message_id_chat_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_message"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_attachment" ADD CONSTRAINT "chat_message_attachment_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;