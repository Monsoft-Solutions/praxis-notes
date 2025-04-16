import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { v4 as uuidv4 } from 'uuid';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { z } from 'zod';

import { locationTable } from '../db';

// mutation to create a location
export const createLocation = protectedEndpoint
    .input(
        z.object({
            name: z.string().min(1).max(255),
            description: z.string().max(1000).optional().nullable(),
            address: z.string().max(500).optional().nullable(),
        }),
    )
    .mutation(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user },
                },
                input,
            }) => {
                const { name, description, address } = input;

                const locationId = uuidv4();

                const { error } = await catchError(
                    db.insert(locationTable).values({
                        id: locationId,
                        organizationId: user.organizationId,
                        name,
                        description: description ?? null,
                        address: address ?? null,
                    }),
                );

                // if insertion failed, return the error
                if (error) {
                    if (error === 'DUPLICATE_ENTRY') return Error('DUPLICATE');

                    return Error();
                }

                // Return the locationId on success
                return Success({ locationId });
            },
        ),
    );
