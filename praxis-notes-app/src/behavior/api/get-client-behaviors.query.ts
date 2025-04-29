import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { eq, or } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { z } from 'zod';

export const getClientBehaviors = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),
        }),
    )
    .query(
        queryMutationCallback(async ({ input: { clientId } }) => {
            const { data: behaviorRecords, error } = await catchError(
                db.query.clientBehaviorTable.findMany({
                    where: (record) => or(eq(record.clientId, clientId)),
                    with: {
                        behavior: true,
                    },
                }),
            );

            if (error) return Error();

            const behaviors = behaviorRecords.map((clientBehavior) => {
                const { id, name, description, organizationId } =
                    clientBehavior.behavior;

                return {
                    id,
                    name,
                    description,
                    isCustom: organizationId !== null,
                    baseline: clientBehavior.baseline,
                    type: clientBehavior.type,
                    behaviorId: clientBehavior.behaviorId,
                };
            });

            return Success(behaviors);
        }),
    );
