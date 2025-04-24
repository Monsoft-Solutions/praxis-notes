ALTER TABLE "core_conf" ADD COLUMN "slack_webhook_url_error" varchar(255) NOT NULL DEFAULT '';
ALTER TABLE "core_conf" ADD COLUMN "slack_webhook_url_info" varchar(255) NOT NULL DEFAULT '';