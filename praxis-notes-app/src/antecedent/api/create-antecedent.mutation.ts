import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { z } from 'zod';
import { createAntecedentProvider } from '@src/antecedent/providers';

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

                const result = await createAntecedentProvider({
                    name,
                    organizationId: user.organizationId,
                });

                if (result.error) return Error(result.error);

                return Success({ id: result.data.id });
            },
        ),
    );
