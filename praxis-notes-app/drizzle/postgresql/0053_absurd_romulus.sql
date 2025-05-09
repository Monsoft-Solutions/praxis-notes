CREATE TABLE "reinforcer" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"organization_id" char(36),
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reinforcer" ADD CONSTRAINT "reinforcer_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;