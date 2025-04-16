import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { eq } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { z } from 'zod';
import { clientLocationTable, locationTable } from '../db';

export const getClientLocations = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),
        }),
    )
    .query(
        queryMutationCallback(async ({ input }) => {
            const { clientId } = input;

            // get the locations for the client
            const { data: clientLocations, error } = await catchError(
                db
                    .select()
                    .from(clientLocationTable)
                    .where(eq(clientLocationTable.clientId, clientId))
                    .innerJoin(
                        locationTable,
                        eq(clientLocationTable.locationId, locationTable.id),
                    ),
            );

            if (error) return Error();

            if (clientLocations.length === 0) return Success([]);

            const locations = clientLocations.map((cl) => ({
                id: cl.location.id,
                name: cl.location.name,
                description: cl.location.description,
                address: cl.location.address,
                clientLocationId: cl.client_location.id,
            }));

            // return the locations for the client
            return Success(locations);
        }),
    );
