import { varchar } from '@db/sql';

// mailer lite core configuration
export const mailerLiteCoreConf = {
    // mailer lite api key
    mailerLiteApiKey: varchar('mailer_lite_api_key', {
        length: 1000,
    })
        .notNull()
        .default(''),

    mailerLiteWelcomeGroupId: varchar('mailer_lite_welcome_group_id', {
        length: 255,
    })
        .notNull()
        .default(''),
};
