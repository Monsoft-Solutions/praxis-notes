import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';
import { v4 as uuidv4 } from 'uuid';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import {
    clientInterventionTable,
    clientBehaviorInterventionTable,
    clientBehaviorTable,
} from '@db/db.tables';
import { eq } from 'drizzle-orm';

import { clientFormInterventionSchema } from '../schemas/client-form-intervention.schema';

// mutation to update client interventions
export const updateClientInterventions = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),
            interventions: z.array(clientFormInterventionSchema),
        }),
    )
    .mutation(
        queryMutationCallback(
            async ({ input: { clientId, interventions } }) => {
                // First get existing interventions for this client
                const existingInterventions = await db
                    .select()
                    .from(clientInterventionTable)
                    .where(eq(clientInterventionTable.clientId, clientId));

                // Get existing client behaviors
                const clientBehaviors = await db
                    .select()
                    .from(clientBehaviorTable)
                    .where(eq(clientBehaviorTable.clientId, clientId));

                // For each intervention
                for (const intervention of interventions) {
                    const existingIntervention = existingInterventions.find(
                        (i) => i.interventionId === intervention.id,
                    );

                    if (existingIntervention) {
                        // Update intervention
                        const { error: updateError } = await catchError(
                            db
                                .update(clientInterventionTable)
                                .set({ updatedAt: Date.now() })
                                .where(
                                    eq(
                                        clientInterventionTable.id,
                                        existingIntervention.id,
                                    ),
                                ),
                        );

                        if (updateError) return Error();

                        // Get existing behavior associations
                        const existingBehaviorAssociations = await db
                            .select()
                            .from(clientBehaviorInterventionTable)
                            .where(
                                eq(
                                    clientBehaviorInterventionTable.clientInterventionId,
                                    existingIntervention.id,
                                ),
                            );

                        // Delete existing behavior associations
                        if (existingBehaviorAssociations.length > 0) {
                            const { error: deleteError } = await catchError(
                                db
                                    .delete(clientBehaviorInterventionTable)
                                    .where(
                                        eq(
                                            clientBehaviorInterventionTable.clientInterventionId,
                                            existingIntervention.id,
                                        ),
                                    ),
                            );

                            if (deleteError) return Error();
                        }

                        // Create new behavior associations
                        for (const behaviorId of intervention.behaviorIds) {
                            const clientBehavior = clientBehaviors.find(
                                (b) => b.behaviorId === behaviorId,
                            );

                            if (!clientBehavior) continue;

                            const { error: insertError } = await catchError(
                                db
                                    .insert(clientBehaviorInterventionTable)
                                    .values({
                                        id: uuidv4(),
                                        clientInterventionId:
                                            existingIntervention.id,
                                        clientBehaviorId: clientBehavior.id,
                                        createdAt: Date.now(),
                                    }),
                            );

                            if (insertError) return Error();
                        }
                    }
                }

                return Success();
            },
        ),
    );
