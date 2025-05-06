import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { eq, or } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { z } from 'zod';

export const getClientReplacementPrograms = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),
        }),
    )
    .query(
        queryMutationCallback(async ({ input: { clientId } }) => {
            const { data: replacementProgramRecords, error } = await catchError(
                db.query.clientReplacementProgramTable.findMany({
                    where: (record) => or(eq(record.clientId, clientId)),
                    with: {
                        replacementProgram: true,
                        behaviors: {
                            with: {
                                behavior: true,
                            },
                        },
                    },
                }),
            );

            if (error) return Error();

            const replacementPrograms = replacementProgramRecords.map(
                ({ replacementProgram, behaviors }) => {
                    const { id, name, description, organizationId } =
                        replacementProgram;

                    return {
                        id,
                        name,
                        description,
                        isCustom: organizationId !== null,
                        behaviorIds: behaviors.map(
                            ({ behaviorId }) => behaviorId,
                        ),
                    };
                },
            );

            return Success(replacementPrograms);
        }),
    );
