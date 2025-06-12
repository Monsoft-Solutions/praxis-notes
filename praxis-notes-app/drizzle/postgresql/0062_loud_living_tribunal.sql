CREATE TYPE "public"."stripe_subscription_status" AS ENUM('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid', 'paused');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('succeeded', 'pending', 'failed', 'canceled', 'processing', 'requires_payment_method', 'requires_confirmation', 'requires_action');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('subscription', 'purchase', 'consume', 'refund', 'manual_adjustment', 'subscription_renewal');--> statement-breakpoint
CREATE TABLE "stripe_subscription_credits" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"stripe_price_id" varchar(255) NOT NULL,
	"credits_amount" bigint NOT NULL,
	"created_at" bigint NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_subscriptions" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"user_id" char(36) NOT NULL,
	"stripe_subscription_id" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"stripe_price_id" varchar(255) NOT NULL,
	"status" "stripe_subscription_status" NOT NULL,
	"current_period_start" bigint,
	"current_period_end" bigint,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "stripe_subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "stripe_products" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"stripe_product_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"metadata" text,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "stripe_products_stripe_product_id_unique" UNIQUE("stripe_product_id")
);
--> statement-breakpoint
CREATE TABLE "stripe_prices" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"stripe_price_id" varchar(255) NOT NULL,
	"stripe_product_id" varchar(255) NOT NULL,
	"amount" bigint NOT NULL,
	"currency" varchar(10) NOT NULL,
	"interval" varchar(20),
	"interval_count" integer,
	"active" boolean DEFAULT true NOT NULL,
	"metadata" text,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "stripe_prices_stripe_price_id_unique" UNIQUE("stripe_price_id")
);
--> statement-breakpoint
CREATE TABLE "stripe_payments" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"user_id" char(36) NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"stripe_invoice_id" varchar(255),
	"amount" bigint NOT NULL,
	"currency" varchar(10) NOT NULL,
	"status" "payment_status" NOT NULL,
	"description" text,
	"created_at" bigint NOT NULL,
	CONSTRAINT "stripe_payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "user_credit_transactions" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"user_id" char(36) NOT NULL,
	"transaction_type" "transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"description" text,
	"metadata" text,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stripe_subscriptions" ADD CONSTRAINT "stripe_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_payments" ADD CONSTRAINT "stripe_payments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credit_transactions" ADD CONSTRAINT "user_credit_transactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;