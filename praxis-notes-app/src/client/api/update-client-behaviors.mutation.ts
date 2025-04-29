import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { clientBehaviorTable } from '@db/db.tables';
import { eq, and, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import { clientFormBehaviorSchema } from '../schemas/client-form-behavior.schema';

// mutation to update client behaviors
export const updateClientBehaviors = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),
            behaviors: z.array(clientFormBehaviorSchema),
        }),
    )
    .mutation(
        queryMutationCallback(async ({ input: { clientId, behaviors } }) => {
            // Start a transaction
            const { error: transactionError } = await catchError(
                db.transaction(async (tx) => {
                    // 1. Fetch existing behaviors for this client within the transaction
                    const existingBehaviors = await tx
                        .select({
                            id: clientBehaviorTable.id,
                            behaviorId: clientBehaviorTable.behaviorId,
                        })
                        .from(clientBehaviorTable)
                        .where(eq(clientBehaviorTable.clientId, clientId));

                    const existingBehaviorIds = existingBehaviors.map(
                        (b) => b.behaviorId,
                    );
                    const inputBehaviorIds = behaviors.map((b) => b.id);

                    // 2. Identify behaviors to add, update, delete
                    const behaviorsToAdd = behaviors.filter(
                        (b) => !existingBehaviorIds.includes(b.id),
                    );
                    const behaviorsToUpdate = behaviors.filter((b) =>
                        existingBehaviorIds.includes(b.id),
                    );
                    const behaviorIdsToDelete = existingBehaviorIds.filter(
                        (id) => !inputBehaviorIds.includes(id),
                    );

                    // 3. Perform Deletions
                    if (behaviorIdsToDelete.length > 0) {
                        await tx
                            .delete(clientBehaviorTable)
                            .where(
                                and(
                                    eq(clientBehaviorTable.clientId, clientId),
                                    inArray(
                                        clientBehaviorTable.behaviorId,
                                        behaviorIdsToDelete,
                                    ),
                                ),
                            );
                    }

                    // 4. Perform Updates
                    for (const behavior of behaviorsToUpdate) {
                        await tx
                            .update(clientBehaviorTable)
                            .set({
                                type: behavior.type,
                                baseline: behavior.baseline,
                                updatedAt: Date.now(),
                            })
                            .where(
                                and(
                                    eq(clientBehaviorTable.clientId, clientId),
                                    eq(
                                        clientBehaviorTable.behaviorId,
                                        behavior.id,
                                    ),
                                ),
                            );
                    }

                    // 5. Perform Insertions
                    if (behaviorsToAdd.length > 0) {
                        await tx.insert(clientBehaviorTable).values(
                            behaviorsToAdd.map((behavior) => ({
                                id: uuidv4(), // Generate a new UUID for the clientBehavior entry
                                clientId: clientId,
                                behaviorId: behavior.id,
                                type: behavior.type,
                                baseline: behavior.baseline,
                                createdAt: Date.now(),
                                updatedAt: Date.now(),
                            })),
                        );
                    }
                }),
            ); // End transaction

            if (transactionError) {
                console.error(
                    'Transaction failed for updateClientBehaviors:',
                    transactionError,
                );
                // Return the original error for better diagnostics
                return Error('TRANSACTION_FAILED');
            }

            return Success();
        }),
    );
