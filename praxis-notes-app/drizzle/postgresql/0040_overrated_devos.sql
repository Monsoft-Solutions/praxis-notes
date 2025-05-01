ALTER TABLE "core_conf" ADD COLUMN "resend_audience_id" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_conf" ADD COLUMN "mailer_lite_api_key" varchar(1000) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_conf" ADD COLUMN "mailer_lite_welcome_group_id" varchar(255) DEFAULT '' NOT NULL;