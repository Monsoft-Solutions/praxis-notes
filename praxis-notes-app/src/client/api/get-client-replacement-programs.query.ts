import { Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { clientReplacementProgramTable } from '@db/db.tables';
import { eq } from 'drizzle-orm';

// query to get client replacement programs
export const getClientReplacementPrograms = protectedEndpoint
    .input(z.object({ clientId: z.string() }))
    .query(
        queryMutationCallback(async ({ input: { clientId } }) => {
            // get client replacement programs from db using relational queries
            const replacementPrograms =
                await db.query.clientReplacementProgramTable.findMany({
                    where: eq(clientReplacementProgramTable.clientId, clientId),
                    with: {
                        // Fetch related behaviors (from the junction table)
                        behaviors: {
                            // Select only the clientBehaviorId from the junction table entries
                            columns: {
                                clientBehaviorId: true,
                            },
                        },
                    },
                });

            // Transform the data to match the expected structure { id: string, behaviorIds: string[] }
            const formattedPrograms = replacementPrograms.map((program) => ({
                id: program.replacementProgramId, // Use replacementProgramId as the primary identifier for the program itself
                behaviorIds: program.behaviors.map(
                    (behavior) => behavior.clientBehaviorId,
                ),
            }));

            return Success(formattedPrograms);
        }),
    );
