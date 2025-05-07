import { varchar } from '@db/sql';

// ai core configuration
export const aiCoreConf = {
    // anthropic api key
    anthropicApiKey: varchar('anthropic_api_key', { length: 255 }).notNull(),

    // langfuse env data
    langfuseSecretKey: varchar('langfuse_secret_key', {
        length: 255,
    }).notNull(),
    langfusePublicKey: varchar('langfuse_public_key', {
        length: 255,
    }).notNull(),
    langfuseBaseUrl: varchar('langfuse_base_url', { length: 500 }).notNull(),
};
