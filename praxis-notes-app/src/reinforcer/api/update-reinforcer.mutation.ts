import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { reinforcerTable } from '../db/reinforcer.table';

import { z } from 'zod';
import { eq } from 'drizzle-orm';

export const updateReinforcer = protectedEndpoint
    .input(
        z.object({
            id: z.string(),
            name: z.string(),
        }),
    )
    .mutation(
        queryMutationCallback(async ({ input }) => {
            const { id, name } = input;

            const { error } = await catchError(
                db
                    .update(reinforcerTable)
                    .set({
                        id,
                        name,
                    })
                    .where(eq(reinforcerTable.id, id)),
            );

            if (error) return Error();

            return Success();
        }),
    );
