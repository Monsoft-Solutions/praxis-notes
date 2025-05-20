import { z } from 'zod';

import { InferInsertModel } from 'drizzle-orm';

import { coreConfTable } from '@db/db.tables';

export const coreConfigData: InferInsertModel<typeof coreConfTable> = {
    id: 'core-config-id',
    name: 'core config',
    usage: 'current',
    randomTemplateDeterministic: true,

    anthropicApiKey: z.string().parse(process.env.MSS_ANTHROPIC_API_KEY),
    openaiApiKey: z.string().parse(process.env.MSS_OPENAI_API_KEY),

    stripeSecretKey: z.string().parse(process.env.MSS_STRIPE_SECRET_KEY),

    resendApiKey: z.string().parse(process.env.MSS_RESEND_API_KEY),
    resendAudienceId: z.string().parse(process.env.MSS_RESEND_AUDIENCE_ID),

    mailerLiteApiKey: z.string().parse(process.env.MSS_MAILER_LITE_API_KEY),
    mailerLiteWelcomeGroupId: z
        .string()
        .parse(process.env.MSS_MAILER_LITE_WELCOME_GROUP_ID),

    slackWebhookUrlError: z
        .string()
        .parse(process.env.MSS_SLACK_WEBHOOK_URL_ERROR),
    slackWebhookUrlInfo: z
        .string()
        .parse(process.env.MSS_SLACK_WEBHOOK_URL_INFO),

    sentryDsn: z.string().parse(process.env.MSS_CLIENT_SENTRY_DSN),

    langfuseSecretKey: z.string().parse(process.env.MSS_LANGFUSE_SECRET_KEY),
    langfusePublicKey: z.string().parse(process.env.MSS_LANGFUSE_PUBLIC_KEY),
    langfuseBaseUrl: z.string().parse(process.env.MSS_LANGFUSE_BASE_URL),

    azureStorageConnectionString: z
        .string()
        .parse(process.env.MSS_AZURE_STORAGE_CONNECTION_STRING),
    azureStorageContainerName: z
        .string()
        .parse(process.env.MSS_AZURE_STORAGE_CONTAINER_NAME),
};
