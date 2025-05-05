import { z } from 'zod';

import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { v4 as uuidv4 } from 'uuid';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { clientFormDataSchema } from '../schemas/client-form-data.schema';

import { createClient as createClientProvider } from '../providers/server';

// mutation to create a template
export const createClient = protectedEndpoint
    .input(
        clientFormDataSchema.and(
            z.object({
                isDraft: z.boolean().optional(),
            }),
        ),
    )
    .mutation(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user },
                },
                input,
            }) => {
                const {
                    firstName,
                    lastName,
                    gender,
                    behaviors,
                    replacementPrograms,
                    interventions,
                    isDraft = false,
                } = input;

                const clientId = uuidv4();

                const { error } = await createClientProvider({
                    id: clientId,
                    clientId,
                    user,

                    clientFormData: {
                        firstName,
                        lastName,
                        gender,
                        behaviors,
                        replacementPrograms,
                        interventions,
                    },

                    isDraft,
                });

                if (error) return Error();

                return Success();
            },
        ),
    );
