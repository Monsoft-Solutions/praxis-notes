import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { eq, or, isNull } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { locationTable } from '../db';

export const getLocations = protectedEndpoint.query(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user },
            },
        }) => {
            // get the locations for the organization
            const { data: locations, error } = await catchError(
                db
                    .select({
                        id: locationTable.id,
                        organizationId: locationTable.organizationId,
                        name: locationTable.name,
                        description: locationTable.description,
                        address: locationTable.address,
                    })
                    .from(locationTable)
                    .where(
                        or(
                            eq(
                                locationTable.organizationId,
                                user.organizationId,
                            ),
                            isNull(locationTable.organizationId),
                        ),
                    ),
            );

            if (error) return Error();

            // return the locations
            return Success(locations);
        },
    ),
);
