import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { clientTable } from '@db/db.tables';

import { eq } from 'drizzle-orm';

// mutation to update a client
export const updateClient = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),
            firstName: z.string(),
            lastName: z.string(),
            isActive: z.boolean(),
        }),
    )
    .mutation(
        queryMutationCallback(async ({ input }) => {
            const { clientId, firstName, lastName, isActive } = input;

            // Update the client record
            const { error } = await catchError(
                db
                    .update(clientTable)
                    .set({
                        firstName,
                        lastName,
                        isActive,
                        updatedAt: Date.now(),
                    })
                    .where(eq(clientTable.id, clientId)),
            );

            // if update failed, return the error
            if (error) {
                if (error === 'DUPLICATE_ENTRY') return Error('DUPLICATE');
                return Error();
            }

            return Success();
        }),
    );
