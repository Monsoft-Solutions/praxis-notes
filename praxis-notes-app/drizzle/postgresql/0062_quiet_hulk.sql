CREATE TYPE "public"."payment_status" AS ENUM('succeeded', 'pending', 'failed', 'canceled', 'processing', 'requires_payment_method', 'requires_confirmation', 'requires_action');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('subscription', 'purchase', 'consume', 'refund', 'manual_adjustment', 'subscription_renewal');--> statement-breakpoint
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
CREATE TABLE "stripe_subscription_credits" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"stripe_price_id" varchar(255) NOT NULL,
	"credits_amount" bigint NOT NULL,
	"created_at" bigint NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "stripe_payments" ADD CONSTRAINT "stripe_payments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credit_transactions" ADD CONSTRAINT "user_credit_transactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_stripe_customer_id_unique" UNIQUE("stripe_customer_id");