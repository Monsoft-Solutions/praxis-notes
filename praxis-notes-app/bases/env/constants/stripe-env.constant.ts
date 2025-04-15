import { rawEnv } from '@env/constants/raw-env.constant';
import { z } from 'zod';

const stripeEnvSchema = z.object({
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
});

export const stripeEnv = stripeEnvSchema.parse(rawEnv);
