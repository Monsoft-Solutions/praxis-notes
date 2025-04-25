ALTER TABLE "core_conf" ADD COLUMN "slack_webhook_url_error" varchar(255) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "core_conf" ADD COLUMN "slack_webhook_url_info" varchar(255) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "core_conf" ADD COLUMN "sentry_dsn" varchar(255) DEFAULT '' NOT NULL DEFAULT '';--> statement-breakpoint