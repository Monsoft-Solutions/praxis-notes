import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { v4 as uuidv4 } from 'uuid';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { reinforcerTable } from '../db/reinforcer.table';

import { z } from 'zod';

// mutation to create a reinforcer
export const createReinforcer = protectedEndpoint
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

                const reinforcerId = uuidv4();

                const { error } = await catchError(
                    db.insert(reinforcerTable).values({
                        id: reinforcerId,
                        organizationId: user.organizationId,

                        name,
                    }),
                );

                // if insertion failed, return the error
                if (error) {
                    if (error === 'DUPLICATE_ENTRY') return Error('DUPLICATE');

                    return Error();
                }

                return Success({ id: reinforcerId });
            },
        ),
    );
