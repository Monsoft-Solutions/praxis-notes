ALTER TABLE "core_conf" ADD COLUMN "openai_api_key" varchar(255) NOT NULL DEFAULT '';

ALTER TABLE "core_conf" ALTER COLUMN "openai_api_key" DROP DEFAULT;
