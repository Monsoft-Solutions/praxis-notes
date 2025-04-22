import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { interventionTable } from '@db/db.tables';

import { z } from 'zod';
import { eq } from 'drizzle-orm';

export const updateIntervention = protectedEndpoint
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
                    .update(interventionTable)
                    .set({
                        id,
                        name,
                        description,
                    })
                    .where(eq(interventionTable.id, id)),
            );

            if (error) return Error();

            return Success();
        }),
    );
