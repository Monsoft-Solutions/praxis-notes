import { Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { clientBehaviorTable } from '@db/db.tables';
import { eq } from 'drizzle-orm';

// query to get client behaviors
export const getClientBehaviors = protectedEndpoint
    .input(z.object({ clientId: z.string() }))
    .query(
        queryMutationCallback(async ({ input: { clientId } }) => {
            // get client behaviors from db
            const behaviors = await db
                .select({
                    id: clientBehaviorTable.id,
                    type: clientBehaviorTable.type,
                    baseline: clientBehaviorTable.baseline,
                    behaviorId: clientBehaviorTable.behaviorId,
                })
                .from(clientBehaviorTable)
                .where(eq(clientBehaviorTable.clientId, clientId));

            return Success(behaviors);
        }),
    );
