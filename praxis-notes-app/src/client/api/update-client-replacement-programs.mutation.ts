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
    clientBehaviorTable,
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
                // First get existing replacement programs for this client
                const existingPrograms = await db
                    .select()
                    .from(clientReplacementProgramTable)
                    .where(
                        eq(clientReplacementProgramTable.clientId, clientId),
                    );

                // Get existing client behaviors
                const clientBehaviors = await db
                    .select()
                    .from(clientBehaviorTable)
                    .where(eq(clientBehaviorTable.clientId, clientId));

                // Track program IDs to identify programs to be deleted
                const updatedProgramIds = replacementPrograms.map((p) => p.id);

                // Delete programs that are no longer in the list
                const programsToDelete = existingPrograms.filter(
                    (p) => !updatedProgramIds.includes(p.replacementProgramId),
                );

                if (programsToDelete.length > 0) {
                    const programIdsToDelete = programsToDelete.map(
                        (p) => p.id,
                    );

                    // First delete all behavior associations for these programs
                    const { error: deleteAssociationsError } = await catchError(
                        db
                            .delete(clientReplacementProgramBehaviorTable)
                            .where(
                                inArray(
                                    clientReplacementProgramBehaviorTable.clientReplacementProgramId,
                                    programIdsToDelete,
                                ),
                            ),
                    );

                    if (deleteAssociationsError) return Error();

                    // Then delete the programs
                    const { error: deleteProgramsError } = await catchError(
                        db
                            .delete(clientReplacementProgramTable)
                            .where(
                                inArray(
                                    clientReplacementProgramTable.id,
                                    programIdsToDelete,
                                ),
                            ),
                    );

                    if (deleteProgramsError) return Error();
                }

                // Process each program in the input
                for (const program of replacementPrograms) {
                    const existingProgram = existingPrograms.find(
                        (p) => p.replacementProgramId === program.id,
                    );

                    if (existingProgram) {
                        // Update existing program - edit behaviors

                        // Get existing behavior associations
                        const existingBehaviorAssociations = await db
                            .select()
                            .from(clientReplacementProgramBehaviorTable)
                            .where(
                                eq(
                                    clientReplacementProgramBehaviorTable.clientReplacementProgramId,
                                    existingProgram.id,
                                ),
                            );

                        // Delete existing behavior associations
                        if (existingBehaviorAssociations.length > 0) {
                            const { error: deleteError } = await catchError(
                                db
                                    .delete(
                                        clientReplacementProgramBehaviorTable,
                                    )
                                    .where(
                                        eq(
                                            clientReplacementProgramBehaviorTable.clientReplacementProgramId,
                                            existingProgram.id,
                                        ),
                                    ),
                            );

                            if (deleteError) return Error();
                        }

                        // Create new behavior associations
                        for (const behaviorId of program.behaviorIds) {
                            const clientBehavior = clientBehaviors.find(
                                (b) => b.behaviorId === behaviorId,
                            );

                            if (!clientBehavior) {
                                continue;
                            }

                            const { error: insertError } = await catchError(
                                db
                                    .insert(
                                        clientReplacementProgramBehaviorTable,
                                    )
                                    .values({
                                        id: uuidv4(),
                                        clientReplacementProgramId:
                                            existingProgram.id,
                                        clientBehaviorId: clientBehavior.id,
                                    }),
                            );

                            if (insertError) return Error();
                        }
                    } else {
                        // Add new replacement program
                        const newProgramId = uuidv4();

                        // Create the new program record
                        const { error: insertProgramError } = await catchError(
                            db.insert(clientReplacementProgramTable).values({
                                id: newProgramId,
                                clientId,
                                replacementProgramId: program.id,
                            }),
                        );

                        if (insertProgramError) return Error();

                        // Add behavior associations for the new program
                        for (const behaviorId of program.behaviorIds) {
                            const clientBehavior = clientBehaviors.find(
                                (b) => b.behaviorId === behaviorId,
                            );

                            if (!clientBehavior) continue;

                            const { error: insertError } = await catchError(
                                db
                                    .insert(
                                        clientReplacementProgramBehaviorTable,
                                    )
                                    .values({
                                        id: uuidv4(),
                                        clientReplacementProgramId:
                                            newProgramId,
                                        clientBehaviorId: clientBehavior.id,
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
