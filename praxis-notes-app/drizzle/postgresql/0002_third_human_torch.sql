CREATE TABLE "antecedent" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"organization_id" char(36),
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "antecedent" ADD CONSTRAINT "antecedent_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;