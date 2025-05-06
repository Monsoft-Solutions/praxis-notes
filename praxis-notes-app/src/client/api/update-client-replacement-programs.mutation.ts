import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';
import { v4 as uuidv4 } from 'uuid';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import {
    clientReplacementProgramTable,
    clientReplacementProgramBehaviorTable,
} from '@db/db.tables';
import { eq, inArray } from 'drizzle-orm';

import { clientFormReplacementProgramSchema } from '../schemas/client-form-replacement-program.schema';

// mutation to update client replacement programs
export const updateClientReplacementPrograms = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),
            replacementPrograms: z.array(clientFormReplacementProgramSchema),
        }),
    )
    .mutation(
        queryMutationCallback(
            async ({ input: { clientId, replacementPrograms } }) => {
                // Wrap everything in a transaction for atomicity
                const { data: _data, error: transactionError } =
                    await catchError(
                        db.transaction(async (tx) => {
                            // First get existing replacement programs for this client
                            const existingPrograms = await tx
                                .select()
                                .from(clientReplacementProgramTable)
                                .where(
                                    eq(
                                        clientReplacementProgramTable.clientId,
                                        clientId,
                                    ),
                                );

                            // Track program IDs to identify programs to be deleted
                            const updatedProgramIds = replacementPrograms.map(
                                (p) => p.id,
                            );

                            // Delete programs that are no longer in the list
                            const programsToDelete = existingPrograms.filter(
                                (p) =>
                                    !updatedProgramIds.includes(
                                        p.replacementProgramId,
                                    ),
                            );

                            if (programsToDelete.length > 0) {
                                const programIdsToDelete = programsToDelete.map(
                                    (p) => p.id,
                                );

                                // First delete all behavior associations for these programs
                                await tx
                                    .delete(
                                        clientReplacementProgramBehaviorTable,
                                    )
                                    .where(
                                        inArray(
                                            clientReplacementProgramBehaviorTable.clientReplacementProgramId,
                                            programIdsToDelete,
                                        ),
                                    );

                                // Then delete the programs
                                await tx
                                    .delete(clientReplacementProgramTable)
                                    .where(
                                        inArray(
                                            clientReplacementProgramTable.id,
                                            programIdsToDelete,
                                        ),
                                    );
                            }

                            // Process each program in the input
                            for (const program of replacementPrograms) {
                                const existingProgram = existingPrograms.find(
                                    (p) =>
                                        p.replacementProgramId === program.id,
                                );

                                if (existingProgram) {
                                    // Update existing program - edit behaviors

                                    // Get existing behavior associations
                                    const existingBehaviorAssociations =
                                        await tx
                                            .select()
                                            .from(
                                                clientReplacementProgramBehaviorTable,
                                            )
                                            .where(
                                                eq(
                                                    clientReplacementProgramBehaviorTable.clientReplacementProgramId,
                                                    existingProgram.id,
                                                ),
                                            );

                                    // Delete existing behavior associations
                                    if (
                                        existingBehaviorAssociations.length > 0
                                    ) {
                                        await tx
                                            .delete(
                                                clientReplacementProgramBehaviorTable,
                                            )
                                            .where(
                                                eq(
                                                    clientReplacementProgramBehaviorTable.clientReplacementProgramId,
                                                    existingProgram.id,
                                                ),
                                            );
                                    }

                                    // Create new behavior associations
                                    for (const behaviorId of program.behaviorIds) {
                                        await tx
                                            .insert(
                                                clientReplacementProgramBehaviorTable,
                                            )
                                            .values({
                                                id: uuidv4(),
                                                clientReplacementProgramId:
                                                    existingProgram.id,
                                                behaviorId,
                                            });
                                    }
                                } else {
                                    // Add new replacement program
                                    const newProgramId = uuidv4();

                                    // Create the new program record
                                    await tx
                                        .insert(clientReplacementProgramTable)
                                        .values({
                                            id: newProgramId,
                                            clientId,
                                            replacementProgramId: program.id,
                                        });

                                    // Add behavior associations for the new program
                                    for (const behaviorId of program.behaviorIds) {
                                        await tx
                                            .insert(
                                                clientReplacementProgramBehaviorTable,
                                            )
                                            .values({
                                                id: uuidv4(),
                                                clientReplacementProgramId:
                                                    newProgramId,
                                                behaviorId,
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
                        'Transaction failed for updateClientReplacementPrograms:',
                        transactionError,
                    );
                    return Error('TRANSACTION_FAILED');
                }

                return Success();
            },
        ),
    );
