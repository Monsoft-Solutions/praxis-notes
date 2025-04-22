import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { v4 as uuidv4 } from 'uuid';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { replacementProgramTable } from '@db/db.tables';

import { z } from 'zod';

// mutation to create a template
export const createReplacementProgram = protectedEndpoint
    .input(
        z.object({
            name: z.string(),
            description: z.string(),
        }),
    )
    .mutation(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user },
                },
                input,
            }) => {
                const { name, description } = input;

                const replacementProgramId = uuidv4();

                const { error } = await catchError(
                    db.insert(replacementProgramTable).values({
                        id: replacementProgramId,
                        organizationId: user.organizationId,

                        name,
                        description,
                    }),
                );

                // if insertion failed, return the error
                if (error) {
                    if (error === 'DUPLICATE_ENTRY') return Error('DUPLICATE');

                    return Error();
                }

                return Success({ id: replacementProgramId });
            },
        ),
    );
