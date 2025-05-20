import { varchar } from '@db/sql';

// openai core configuration
export const openaiCoreConf = {
    // openai api key
    openaiApiKey: varchar('openai_api_key', { length: 255 }).notNull(),
};
