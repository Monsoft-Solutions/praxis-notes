import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { clientLocationTable } from '../db';

import { z } from 'zod';

// mutation to add a location to a client
export const addClientLocation = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),
            locationId: z.string(),
        }),
    )
    .mutation(
        queryMutationCallback(async ({ input }) => {
            const { clientId, locationId } = input;
            const now = Date.now();

            const { error } = await catchError(
                db.insert(clientLocationTable).values({
                    clientId,
                    locationId,
                    createdAt: now,
                }),
            );

            // if insertion failed, return the error
            if (error) {
                if (error === 'DUPLICATE_ENTRY') return Error('DUPLICATE');

                return Error();
            }

            return Success();
        }),
    );
