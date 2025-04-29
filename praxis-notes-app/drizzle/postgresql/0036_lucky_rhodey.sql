CREATE TYPE "public"."feedback_status" AS ENUM('pending', 'reviewed', 'implemented', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."feedback_type" AS ENUM('feature', 'improvement', 'ux', 'performance', 'other');--> statement-breakpoint
CREATE TYPE "public"."app_area" AS ENUM('notes', 'auth', 'ui', 'sync', 'search', 'other');--> statement-breakpoint
CREATE TYPE "public"."bug_severity" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."bug_status" AS ENUM('pending', 'investigating', 'fixed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."support_status" AS ENUM('pending', 'in-progress', 'resolved');--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"user_id" char(36) NOT NULL,
	"type" "feedback_type" NOT NULL,
	"text" text NOT NULL,
	"created_at" bigint NOT NULL,
	"status" "feedback_status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bug_report" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"user_id" char(36) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"steps_to_reproduce" text,
	"area" "app_area",
	"severity" "bug_severity",
	"screenshot_path" varchar(255),
	"created_at" bigint NOT NULL,
	"status" "bug_status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_message" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"user_id" char(36),
	"message" text NOT NULL,
	"created_at" bigint NOT NULL,
	"status" "support_status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_report" ADD CONSTRAINT "bug_report_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_message" ADD CONSTRAINT "support_message_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;