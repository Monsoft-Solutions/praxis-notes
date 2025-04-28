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

                // Track intervention IDs to identify interventions to be deleted
                const updatedInterventionIds = interventions.map((i) => i.id);

                // Delete interventions that are no longer in the list
                const interventionsToDelete = existingInterventions.filter(
                    (i) => !updatedInterventionIds.includes(i.interventionId),
                );

                if (interventionsToDelete.length > 0) {
                    const interventionIdsToDelete = interventionsToDelete.map(
                        (i) => i.id,
                    );

                    // First delete all behavior associations for these interventions
                    const { error: deleteAssociationsError } = await catchError(
                        db
                            .delete(clientBehaviorInterventionTable)
                            .where(
                                inArray(
                                    clientBehaviorInterventionTable.clientInterventionId,
                                    interventionIdsToDelete,
                                ),
                            ),
                    );

                    if (deleteAssociationsError) return Error();

                    // Then delete the interventions
                    const { error: deleteInterventionsError } =
                        await catchError(
                            db
                                .delete(clientInterventionTable)
                                .where(
                                    inArray(
                                        clientInterventionTable.id,
                                        interventionIdsToDelete,
                                    ),
                                ),
                        );

                    if (deleteInterventionsError) return Error();
                }

                // Process each intervention in the input
                for (const intervention of interventions) {
                    const existingIntervention = existingInterventions.find(
                        (i) => i.interventionId === intervention.id,
                    );

                    if (existingIntervention) {
                        // Update intervention - for now just update the timestamp
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
                    } else {
                        // Add new intervention
                        const newInterventionId = uuidv4();

                        // Create the new intervention record
                        const { error: insertInterventionError } =
                            await catchError(
                                db.insert(clientInterventionTable).values({
                                    id: newInterventionId,
                                    clientId,
                                    interventionId: intervention.id,
                                    createdAt: Date.now(),
                                    updatedAt: Date.now(),
                                }),
                            );

                        if (insertInterventionError) return Error();

                        // Add behavior associations for the new intervention
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
                                        clientInterventionId: newInterventionId,
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
