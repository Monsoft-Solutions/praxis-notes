import { z } from 'zod';

import { eq } from 'drizzle-orm';

import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { protectedEndpoint } from '@api/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { clientFormDataSchema } from '../schemas/client-form-data.schema';

import { createClient as createClientProvider } from '../providers/server';

import { db } from '@db/providers/server';

import { clientTable } from '@db/db.tables';

// mutation to create a template
export const updateClient = protectedEndpoint
    .input(
        clientFormDataSchema.and(
            z.object({
                clientId: z.string(),
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
                    clientId,
                } = input;

                const { error: clientDeleteError } = await catchError(
                    db.delete(clientTable).where(eq(clientTable.id, clientId)),
                );

                if (clientDeleteError) return Error();

                const { error: clientCreateError } = await createClientProvider(
                    {
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
                    },
                );

                if (clientCreateError) return Error();

                return Success();
            },
        ),
    );
