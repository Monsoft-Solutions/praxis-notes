import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { desc, eq } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { z } from 'zod';

export const getClientSessions = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),
        }),
    )
    .query(
        queryMutationCallback(async ({ input: { clientId } }) => {
            // get the templates matching the search query
            const { data: clientSessions, error } = await catchError(
                db.query.clientSessionTable.findMany({
                    where: (record) => eq(record.clientId, clientId),
                    orderBy: (record) => [desc(record.sessionDate)],
                }),
            );

            if (error) return Error();

            // return the templates matching the search query
            return Success(clientSessions);
        }),
    );
