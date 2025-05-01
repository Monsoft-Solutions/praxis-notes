import { varchar } from '@db/sql';

// resend core configuration
export const resendCoreConf = {
    // resend api key
    resendApiKey: varchar('resend_api_key', { length: 255 })
        .notNull()
        .default(''),

    resendAudienceId: varchar('resend_audience_id', { length: 255 })
        .notNull()
        .default(''),
};
