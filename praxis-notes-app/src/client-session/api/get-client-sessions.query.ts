import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { desc, eq, sql } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { z } from 'zod';

import { clientSessionsListSchema } from '../schemas';

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
                    columns: {
                        id: true,
                        sessionDate: true,
                        startTime: true,
                        endTime: true,
                        location: true,
                    },
                    extras: {
                        draft: sql<boolean>`CASE 
                            WHEN notes IS NOT NULL AND notes != '' 
                            THEN false 
                            ELSE true 
                        END`.as('draft'),
                    },
                }),
            );

            if (error) return Error();

            // return the client sessions with validation
            return Success(clientSessionsListSchema.parse(clientSessions));
        }),
    );
