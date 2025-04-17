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
            // get the templates matching the search query
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
                                clientBehavior: {
                                    with: {
                                        behavior: true,
                                    },
                                },
                                clientIntervention: {
                                    with: {
                                        intervention: true,
                                    },
                                },
                            },
                        },
                    },
                }),
            );

            if (error) return Error();

            if (!clientSessionRecords) return Error('NOT_FOUND');

            const abcEntriesNullable = clientSessionRecords.abcEntries.map(
                ({ id, antecedent, clientBehavior, clientIntervention }) => {
                    if (!antecedent || !clientBehavior || !clientIntervention)
                        return null;

                    const { behavior } = clientBehavior;

                    const { intervention } = clientIntervention;

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

            // return the templates matching the search query
            return Success(clientSession);
        }),
    );
