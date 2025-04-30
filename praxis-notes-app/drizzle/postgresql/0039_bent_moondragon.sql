ALTER TABLE "core_conf" ADD COLUMN IF NOT EXISTS "resend_audience_id" varchar(255) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "core_conf" ADD COLUMN IF NOT EXISTS "mailer_lite_api_key" varchar(1000) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "core_conf" ADD COLUMN IF NOT EXISTS "mailer_lite_welcome_group_id" varchar(1000) NOT NULL DEFAULT '';