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
} from '@db/db.tables';
import { eq, inArray } from 'drizzle-orm';

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
                // Wrap everything in a transaction for atomicity
                const { data: _data, error: transactionError } =
                    await catchError(
                        db.transaction(async (tx) => {
                            // First get existing interventions for this client
                            const existingInterventions = await tx
                                .select()
                                .from(clientInterventionTable)
                                .where(
                                    eq(
                                        clientInterventionTable.clientId,
                                        clientId,
                                    ),
                                );

                            // Track intervention IDs to identify interventions to be deleted
                            const updatedInterventionIds = interventions.map(
                                (i) => i.id,
                            );

                            // Delete interventions that are no longer in the list
                            const interventionsToDelete =
                                existingInterventions.filter(
                                    (i) =>
                                        !updatedInterventionIds.includes(
                                            i.interventionId,
                                        ),
                                );

                            if (interventionsToDelete.length > 0) {
                                const interventionIdsToDelete =
                                    interventionsToDelete.map((i) => i.id);

                                // First delete all behavior associations for these interventions
                                await tx
                                    .delete(clientBehaviorInterventionTable)
                                    .where(
                                        inArray(
                                            clientBehaviorInterventionTable.clientInterventionId,
                                            interventionIdsToDelete,
                                        ),
                                    );

                                // Then delete the interventions
                                await tx
                                    .delete(clientInterventionTable)
                                    .where(
                                        inArray(
                                            clientInterventionTable.id,
                                            interventionIdsToDelete,
                                        ),
                                    );
                            }

                            // Process each intervention in the input
                            for (const intervention of interventions) {
                                const existingIntervention =
                                    existingInterventions.find(
                                        (i) =>
                                            i.interventionId ===
                                            intervention.id,
                                    );

                                if (existingIntervention) {
                                    // Update intervention - for now just update the timestamp
                                    await tx
                                        .update(clientInterventionTable)
                                        .set({ updatedAt: Date.now() })
                                        .where(
                                            eq(
                                                clientInterventionTable.id,
                                                existingIntervention.id,
                                            ),
                                        );

                                    // Get existing behavior associations
                                    const existingBehaviorAssociations =
                                        await tx
                                            .select()
                                            .from(
                                                clientBehaviorInterventionTable,
                                            )
                                            .where(
                                                eq(
                                                    clientBehaviorInterventionTable.clientInterventionId,
                                                    existingIntervention.id,
                                                ),
                                            );

                                    // Delete existing behavior associations
                                    if (
                                        existingBehaviorAssociations.length > 0
                                    ) {
                                        await tx
                                            .delete(
                                                clientBehaviorInterventionTable,
                                            )
                                            .where(
                                                eq(
                                                    clientBehaviorInterventionTable.clientInterventionId,
                                                    existingIntervention.id,
                                                ),
                                            );
                                    }

                                    // Create new behavior associations
                                    for (const behaviorId of intervention.behaviorIds) {
                                        await tx
                                            .insert(
                                                clientBehaviorInterventionTable,
                                            )
                                            .values({
                                                id: uuidv4(),
                                                clientInterventionId:
                                                    existingIntervention.id,
                                                behaviorId,
                                                createdAt: Date.now(),
                                            });
                                    }
                                } else {
                                    // Add new intervention
                                    const newInterventionId = uuidv4();

                                    // Create the new intervention record
                                    await tx
                                        .insert(clientInterventionTable)
                                        .values({
                                            id: newInterventionId,
                                            clientId,
                                            interventionId: intervention.id,
                                            createdAt: Date.now(),
                                            updatedAt: Date.now(),
                                        });

                                    // Add behavior associations for the new intervention
                                    for (const behaviorId of intervention.behaviorIds) {
                                        await tx
                                            .insert(
                                                clientBehaviorInterventionTable,
                                            )
                                            .values({
                                                id: uuidv4(),
                                                clientInterventionId:
                                                    newInterventionId,
                                                behaviorId,
                                                createdAt: Date.now(),
                                            });
                                    }
                                }
                            }

                            // If we get here, all operations succeeded
                            return true;
                        }),
                    );

                if (transactionError) {
                    console.error(
                        'Transaction failed for updateClientInterventions:',
                        transactionError,
                    );
                    return Error('TRANSACTION_FAILED');
                }

                return Success();
            },
        ),
    );
