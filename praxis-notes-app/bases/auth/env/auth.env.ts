import { z } from 'zod';

// auth environment schema
export const authEnvSchema = z.object({
    MSS_AUTH_SECRET: z.string(),
});
