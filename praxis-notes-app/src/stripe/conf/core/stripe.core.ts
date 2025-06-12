import { varchar } from '@db/sql';

// stripe core configuration
export const stripeCoreConf = {
    // stripe secret key
    stripeSecretKey: varchar('stripe_secret_key', { length: 255 }).notNull(),

    stripeWebhookSecret: varchar('stripe_webhook_secret', {
        length: 255,
    }).notNull(),
};
