import { varchar } from '@db/sql';

// langfuse core configuration
export const langfuseCoreConf = {
    // langfuse env data
    langfuseSecretKey: varchar('langfuse_secret_key', {
        length: 255,
    }).notNull(),

    langfusePublicKey: varchar('langfuse_public_key', {
        length: 255,
    }).notNull(),

    langfuseBaseUrl: varchar('langfuse_base_url', { length: 500 }).notNull(),
};
