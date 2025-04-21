import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { antecedentTable } from '@db/db.tables';

import { z } from 'zod';
import { eq } from 'drizzle-orm';

export const updateAntecedent = protectedEndpoint
    .input(
        z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
        }),
    )
    .mutation(
        queryMutationCallback(async ({ input }) => {
            const { id, name, description } = input;

            const { error } = await catchError(
                db
                    .update(antecedentTable)
                    .set({
                        id,
                        name,
                        description,
                    })
                    .where(eq(antecedentTable.id, id)),
            );

            if (error) return Error();

            return Success();
        }),
    );
