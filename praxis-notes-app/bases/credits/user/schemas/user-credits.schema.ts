import { createSelectSchema } from 'drizzle-zod';

import { table } from '@db/sql';

import { appUserCredits } from '../constants';
import { z } from 'zod';

const auxTable = table('', {
    ...appUserCredits,
});

export const userCreditsSchema = z.object({
    ...createSelectSchema(auxTable).shape,
});

export const userCreditsWithErrorSchema = z.union([
    z.object({
        data: userCreditsSchema,
        error: z.null(),
    }),

    z.object({
        data: z.undefined(),
        error: z.string(),
    }),
]);

export type UserCredits = typeof userCreditsSchema._type;
