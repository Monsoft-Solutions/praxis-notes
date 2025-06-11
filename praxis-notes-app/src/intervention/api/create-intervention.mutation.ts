import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { z } from 'zod';
import { createInterventionProvider } from '@src/intervention/providers';

// mutation to create a template
export const createIntervention = protectedEndpoint
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

                const result = await createInterventionProvider({
                    name,
                    description,
                    organizationId: user.organizationId,
                });

                if (result.error) return Error(result.error);

                return Success({ id: result.data.id });
            },
        ),
    );
