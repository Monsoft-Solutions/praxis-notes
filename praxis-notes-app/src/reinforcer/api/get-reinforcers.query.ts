import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { eq, isNull, or } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

export const getReinforcers = protectedEndpoint.query(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user },
            },
        }) => {
            // get the reinforcers matching the search query
            const { data: reinforcerRecords, error } = await catchError(
                db.query.reinforcerTable.findMany({
                    where: (record) =>
                        or(
                            eq(record.organizationId, user.organizationId),
                            isNull(record.organizationId),
                        ),
                }),
            );

            if (error) return Error();

            const reinforcers = reinforcerRecords.map((record) => ({
                id: record.id,
                name: record.name,
                isCustom: record.organizationId !== null,
            }));

            // return the reinforcers matching the search query
            return Success(reinforcers);
        },
    ),
);
