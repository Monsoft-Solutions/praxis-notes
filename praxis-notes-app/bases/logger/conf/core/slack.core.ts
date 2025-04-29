import { varchar } from '@db/sql';

// resend core configuration
export const slackCoreConf = {
    // slack webhook url
    slackWebhookUrlError: varchar('slack_webhook_url_error', {
        length: 255,
    }).notNull(),
    slackWebhookUrlInfo: varchar('slack_webhook_url_info', {
        length: 255,
    }).notNull(),
};
