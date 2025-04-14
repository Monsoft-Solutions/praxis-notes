import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { eq } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

export const getClients = protectedEndpoint.query(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user },
            },
        }) => {
            // get the templates matching the search query
            const { data: clients, error } = await catchError(
                db.query.clientTable.findMany({
                    where: (record) =>
                        eq(record.organizationId, user.organizationId),
                }),
            );

            if (error) return Error();

            // return the templates matching the search query
            return Success(clients);
        },
    ),
);
