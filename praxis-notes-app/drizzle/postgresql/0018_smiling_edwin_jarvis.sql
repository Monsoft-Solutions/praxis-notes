CREATE TYPE "public"."price_type" AS ENUM('one_time', 'recurring');--> statement-breakpoint
CREATE TYPE "public"."recurring_interval" AS ENUM('day', 'week', 'month', 'year');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'requires_capture', 'canceled', 'succeeded');--> statement-breakpoint
CREATE TABLE "stripe_customer" (
	"user_id" char(36) PRIMARY KEY NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	CONSTRAINT "stripe_customer_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "stripe_price" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"currency" char(3) NOT NULL,
	"description" varchar(255),
	"type" "price_type" NOT NULL,
	"unit_amount" bigint NOT NULL,
	"recurring_interval" "recurring_interval",
	"recurring_interval_count" bigint,
	"trial_period_days" bigint
);
--> statement-breakpoint
CREATE TABLE "stripe_product" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" bigint,
	"updated_at" bigint
);
--> statement-breakpoint
CREATE TABLE "stripe_subscription" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" char(36) NOT NULL,
	"price_id" varchar(255) NOT NULL,
	"status" "subscription_status" NOT NULL,
	"current_period_end" bigint NOT NULL,
	"current_period_start" bigint NOT NULL,
	"canceled_at" bigint,
	"cancel_at" bigint,
	"cancel_at_period_end" boolean DEFAULT false,
	"trial_start" bigint,
	"trial_end" bigint
);
--> statement-breakpoint
CREATE TABLE "stripe_payment" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" char(36) NOT NULL,
	"subscription_id" varchar(255),
	"amount" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"status" "payment_status" NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stripe_customer" ADD CONSTRAINT "stripe_customer_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_price" ADD CONSTRAINT "stripe_price_product_id_stripe_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."stripe_product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_subscription" ADD CONSTRAINT "stripe_subscription_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_subscription" ADD CONSTRAINT "stripe_subscription_price_id_stripe_price_id_fk" FOREIGN KEY ("price_id") REFERENCES "public"."stripe_price"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_payment" ADD CONSTRAINT "stripe_payment_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_payment" ADD CONSTRAINT "stripe_payment_subscription_id_stripe_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."stripe_subscription"("id") ON DELETE no action ON UPDATE no action;