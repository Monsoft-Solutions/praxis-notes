CREATE TABLE "location" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"organization_id" char(36),
	"name" varchar(255) NOT NULL,
	"description" varchar(1000),
	"address" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "client_location" (
	"client_id" char(36) NOT NULL,
	"location_id" char(36) NOT NULL,
	"created_at" bigint NOT NULL,
	CONSTRAINT "client_location_client_id_location_id_pk" PRIMARY KEY("client_id","location_id")
);
--> statement-breakpoint
ALTER TABLE "location" ADD CONSTRAINT "location_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_location" ADD CONSTRAINT "client_location_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_location" ADD CONSTRAINT "client_location_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE no action;