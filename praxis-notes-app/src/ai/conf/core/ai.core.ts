import { varchar } from '@db/sql';

// ai core configuration
export const aiCoreConf = {
    // anthropic api key
    anthropicApiKey: varchar('anthropic_api_key', { length: 255 }).notNull(),
};
