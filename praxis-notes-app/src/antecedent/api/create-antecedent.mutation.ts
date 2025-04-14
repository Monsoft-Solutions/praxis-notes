import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { v4 as uuidv4 } from 'uuid';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { antecedentTable } from '@db/db.tables';

import { z } from 'zod';

// mutation to create a template
export const createAntecedent = protectedEndpoint
    .input(
        z.object({
            name: z.string(),
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
                const { name } = input;

                const antecedentId = uuidv4();

                const { error } = await catchError(
                    db.insert(antecedentTable).values({
                        id: antecedentId,
                        organizationId: user.organizationId,

                        name,
                    }),
                );

                // if insertion failed, return the error
                if (error) {
                    if (error === 'DUPLICATE_ENTRY') return Error('DUPLICATE');

                    return Error();
                }

                return Success();
            },
        ),
    );
