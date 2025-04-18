import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { eq } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { z } from 'zod';

export const getClientSession = protectedEndpoint
    .input(
        z.object({
            sessionId: z.string(),
        }),
    )
    .query(
        queryMutationCallback(async ({ input: { sessionId } }) => {
            const { data: clientSessionRecords, error } = await catchError(
                db.query.clientSessionTable.findFirst({
                    where: (record) => eq(record.id, sessionId),

                    with: {
                        client: true,
                        participants: true,
                        environmentalChanges: true,
                        abcEntries: {
                            with: {
                                antecedent: true,
                                behavior: true,
                                intervention: true,
                            },
                        },
                    },
                }),
            );

            if (error) return Error();

            if (!clientSessionRecords) return Error('NOT_FOUND');

            const abcEntriesNullable = clientSessionRecords.abcEntries.map(
                ({ id, antecedent, behavior, intervention }) => {
                    if (!antecedent || !behavior || !intervention) return null;

                    return {
                        id,
                        antecedent,
                        behavior,
                        intervention,
                    };
                },
            );

            const abcEntries = abcEntriesNullable.filter(
                (abcEntry) => abcEntry !== null,
            );

            const clientSession = {
                ...clientSessionRecords,
                abcEntries,
            };

            return Success(clientSession);
        }),
    );
