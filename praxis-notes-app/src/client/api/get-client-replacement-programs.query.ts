import { Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import {
    clientReplacementProgramTable,
    clientReplacementProgramBehaviorTable,
} from '@db/db.tables';
import { eq } from 'drizzle-orm';

// query to get client replacement programs
export const getClientReplacementPrograms = protectedEndpoint
    .input(z.object({ clientId: z.string() }))
    .query(
        queryMutationCallback(async ({ input: { clientId } }) => {
            // get client replacement programs from db
            const replacementPrograms = await db
                .select()
                .from(clientReplacementProgramTable)
                .where(eq(clientReplacementProgramTable.clientId, clientId));

            // Get related behaviors for each replacement program
            const replacementProgramsWithBehaviors = await Promise.all(
                replacementPrograms.map(async (program) => {
                    const behaviors = await db
                        .select()
                        .from(clientReplacementProgramBehaviorTable)
                        .where(
                            eq(
                                clientReplacementProgramBehaviorTable.clientReplacementProgramId,
                                program.id,
                            ),
                        );

                    return {
                        ...program,
                        behaviorIds: behaviors.map((b) => b.clientBehaviorId),
                    };
                }),
            );

            return Success(replacementProgramsWithBehaviors);
        }),
    );
