CREATE TYPE "public"."name" AS ENUM('template_creator', 'template_reviewer', 'template_cleaner', 'template_service_admin');--> statement-breakpoint
CREATE TYPE "public"."core_conf_usage" AS ENUM('current', 'next');--> statement-breakpoint
CREATE TYPE "public"."custom_conf_usage" AS ENUM('current', 'next');--> statement-breakpoint
CREATE TYPE "public"."template_status" AS ENUM('draft', 'finished');--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"organization_id" char(36) NOT NULL,
	"firstName" varchar(255) NOT NULL,
	"lastName" varchar(255),
	"bookmarked" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "authentications" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"user_id" char(36) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	CONSTRAINT "authentications_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "authentications_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"user_id" char(36) NOT NULL,
	"expires_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"name" "name" NOT NULL,
	"description" text,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"user_id" char(36) NOT NULL,
	"role_id" char(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_conf" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"usage" "core_conf_usage",
	"random_template_deterministic" boolean NOT NULL,
	CONSTRAINT "core_conf_name_unique" UNIQUE("name"),
	CONSTRAINT "core_conf_usage_unique" UNIQUE("usage")
);
--> statement-breakpoint
CREATE TABLE "custom_conf" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"organization_id" char(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"usage" "custom_conf_usage",
	"random_template_service_active" boolean NOT NULL,
	CONSTRAINT "custom_conf_name_unique" UNIQUE("name"),
	CONSTRAINT "custom_conf_usage_unique" UNIQUE("usage")
);
--> statement-breakpoint
CREATE TABLE "template" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"creator" char(36) NOT NULL,
	"status" "template_status" DEFAULT 'draft' NOT NULL,
	CONSTRAINT "template_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"organization_id" char(36) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" integer NOT NULL,
	"updated_at" integer NOT NULL,
	"created_by" char(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_client" (
	"user_id" char(36) NOT NULL,
	"client_id" char(36) NOT NULL,
	"created_at" integer NOT NULL,
	"updated_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "behavior" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"organization_id" char(36),
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_by" char(36) NOT NULL,
	"updated_by" char(36) NOT NULL,
	"created_at" integer NOT NULL,
	"updated_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_behavior" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"client_id" char(36) NOT NULL,
	"behavior_id" char(36) NOT NULL,
	"created_at" integer NOT NULL,
	"updated_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interventions" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"organization_id" char(36),
	"created_at" integer NOT NULL,
	"updated_at" integer NOT NULL,
	"created_by" char(36) NOT NULL,
	"updated_by" char(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_intervention" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"client_id" char(36) NOT NULL,
	"created_at" integer NOT NULL,
	"updated_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_behavior_intervention" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"client_intervention_id" char(36) NOT NULL,
	"client_behavior_id" char(36) NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "replacement_programs" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"organization_id" char(36),
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" integer NOT NULL,
	"updated_at" integer NOT NULL,
	"created_by" char(36) NOT NULL,
	"updated_by" char(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_replacement_programs" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"client_id" char(36) NOT NULL,
	"created_at" integer NOT NULL,
	"updated_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_replacement_program_behaviors" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"client_replacement_program_id" char(36) NOT NULL,
	"client_behavior_id" char(36) NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authentications" ADD CONSTRAINT "authentications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_conf" ADD CONSTRAINT "custom_conf_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template" ADD CONSTRAINT "template_creator_users_id_fk" FOREIGN KEY ("creator") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_client" ADD CONSTRAINT "user_client_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_client" ADD CONSTRAINT "user_client_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "behavior" ADD CONSTRAINT "behavior_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "behavior" ADD CONSTRAINT "behavior_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "behavior" ADD CONSTRAINT "behavior_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_behavior" ADD CONSTRAINT "client_behavior_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_behavior" ADD CONSTRAINT "client_behavior_behavior_id_behavior_id_fk" FOREIGN KEY ("behavior_id") REFERENCES "public"."behavior"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_intervention" ADD CONSTRAINT "client_intervention_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_behavior_intervention" ADD CONSTRAINT "client_behavior_intervention_client_intervention_id_client_intervention_id_fk" FOREIGN KEY ("client_intervention_id") REFERENCES "public"."client_intervention"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_behavior_intervention" ADD CONSTRAINT "client_behavior_intervention_client_behavior_id_client_behavior_id_fk" FOREIGN KEY ("client_behavior_id") REFERENCES "public"."client_behavior"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replacement_programs" ADD CONSTRAINT "replacement_programs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replacement_programs" ADD CONSTRAINT "replacement_programs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replacement_programs" ADD CONSTRAINT "replacement_programs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_replacement_programs" ADD CONSTRAINT "client_replacement_programs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_replacement_program_behaviors" ADD CONSTRAINT "client_replacement_program_behaviors_client_replacement_program_id_client_replacement_programs_id_fk" FOREIGN KEY ("client_replacement_program_id") REFERENCES "public"."client_replacement_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_replacement_program_behaviors" ADD CONSTRAINT "client_replacement_program_behaviors_client_behavior_id_client_behavior_id_fk" FOREIGN KEY ("client_behavior_id") REFERENCES "public"."client_behavior"("id") ON DELETE cascade ON UPDATE no action;