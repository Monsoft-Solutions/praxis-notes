CREATE TABLE "unverified_email" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"user_id" char(36) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	CONSTRAINT "unverified_email_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "unverified_email_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "unverified_email" ADD CONSTRAINT "unverified_email_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;