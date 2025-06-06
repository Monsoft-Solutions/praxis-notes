import { clientFormDataSchema } from '@src/client/schemas';
import { z } from 'zod';

export const createClientToolParamsSchema = clientFormDataSchema.merge(
    z.object({
        userId: z.string(),
        organizationId: z.string(),
    }),
);

export type CreateClientToolParams = z.infer<
    typeof createClientToolParamsSchema
>;
