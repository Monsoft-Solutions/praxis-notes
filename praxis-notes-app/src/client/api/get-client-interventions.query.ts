import { Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import {
    clientInterventionTable,
    clientBehaviorInterventionTable,
} from '@db/db.tables';
import { eq } from 'drizzle-orm';

// query to get client interventions
export const getClientInterventions = protectedEndpoint
    .input(z.object({ clientId: z.string() }))
    .query(
        queryMutationCallback(async ({ input: { clientId } }) => {
            // get client interventions from db
            const interventions = await db
                .select()
                .from(clientInterventionTable)
                .where(eq(clientInterventionTable.clientId, clientId));

            // Get related behaviors for each intervention
            const interventionsWithBehaviors = await Promise.all(
                interventions.map(async (intervention) => {
                    const behaviors = await db
                        .select()
                        .from(clientBehaviorInterventionTable)
                        .where(
                            eq(
                                clientBehaviorInterventionTable.clientInterventionId,
                                intervention.id,
                            ),
                        );

                    return {
                        ...intervention,
                        behaviorIds: behaviors.map((b) => b.clientBehaviorId),
                    };
                }),
            );

            return Success(interventionsWithBehaviors);
        }),
    );
