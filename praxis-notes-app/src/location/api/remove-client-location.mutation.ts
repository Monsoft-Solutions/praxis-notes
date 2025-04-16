import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { and, eq } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { clientLocationTable } from '../db';

import { z } from 'zod';

// mutation to remove a location from a client
export const removeClientLocation = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),
            locationId: z.string(),
        }),
    )
    .mutation(
        queryMutationCallback(async ({ input }) => {
            const { clientId, locationId } = input;

            const { error } = await catchError(
                db
                    .delete(clientLocationTable)
                    .where(
                        and(
                            eq(clientLocationTable.clientId, clientId),
                            eq(clientLocationTable.locationId, locationId),
                        ),
                    ),
            );

            if (error) return Error();

            return Success();
        }),
    );
