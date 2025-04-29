ALTER TABLE "core_conf" ADD COLUMN "slack_webhook_url_error" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "core_conf" ADD COLUMN "slack_webhook_url_info" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "core_conf" ADD COLUMN "sentry_dsn" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "bug_report" DROP COLUMN "screenshot_path";