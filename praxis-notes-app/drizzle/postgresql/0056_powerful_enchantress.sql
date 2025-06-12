ALTER TABLE "core_conf" ADD COLUMN "azure_storage_connection_string" varchar NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "core_conf" ADD COLUMN "azure_storage_container_name" varchar NOT NULL DEFAULT '';

ALTER TABLE "core_conf" ALTER COLUMN "azure_storage_connection_string" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "core_conf" ALTER COLUMN "azure_storage_container_name" DROP DEFAULT;
