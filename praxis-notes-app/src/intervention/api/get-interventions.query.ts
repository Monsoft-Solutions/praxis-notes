import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { eq, isNull, or } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

export const getInterventions = protectedEndpoint.query(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user },
            },
        }) => {
            // get the templates matching the search query
            const { data: interventions, error } = await catchError(
                db.query.interventionTable.findMany({
                    where: (record) =>
                        or(
                            eq(record.organizationId, user.organizationId),
                            isNull(record.organizationId),
                        ),
                }),
            );

            if (error) return Error();

            // return the templates matching the search query
            return Success(interventions);
        },
    ),
);
