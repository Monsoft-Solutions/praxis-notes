import { z } from 'zod';

import { InferInsertModel } from 'drizzle-orm';

import { coreConfTable } from '@db/db.tables';

export const coreConfigData: InferInsertModel<typeof coreConfTable> = {
    id: 'core-config-id',
    name: 'core config',
    usage: 'current',
    randomTemplateDeterministic: true,
    anthropicApiKey: z.string().parse(process.env.ANTHROPIC_API_KEY),
    stripeSecretKey: z.string().parse(process.env.STRIPE_SECRET_KEY),
    resendApiKey: z.string().parse(process.env.RESEND_API_KEY),
};
