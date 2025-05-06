import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { clientTable } from '@db/db.tables';
import { eq } from 'drizzle-orm';

// query to get a single client
export const getClient = protectedEndpoint
    .input(z.object({ clientId: z.string() }))
    .query(
        queryMutationCallback(async ({ input: { clientId } }) => {
            // get client from db
            const client = await db.query.clientTable.findFirst({
                where: eq(clientTable.id, clientId),

                with: {
                    behaviors: {
                        with: {
                            behavior: true,
                        },
                    },
                    replacementPrograms: {
                        with: {
                            replacementProgram: true,
                            behaviors: true,
                        },
                    },
                    interventions: {
                        with: {
                            intervention: true,
                            behaviors: true,
                        },
                    },
                },
            });

            if (!client) return Error('NOT_FOUND');

            const behaviors = client.behaviors.map(
                ({ behavior, type, baseline }) => ({
                    ...behavior,
                    type,
                    baseline,
                }),
            );

            const replacementPrograms = client.replacementPrograms.map(
                ({ replacementProgram: { id }, behaviors }) => ({
                    id,
                    behaviorIds: behaviors.map(({ behaviorId }) => behaviorId),
                }),
            );

            const interventions = client.interventions.map(
                ({ intervention: { id }, behaviors }) => ({
                    id,
                    behaviorIds: behaviors.map(({ behaviorId }) => behaviorId),
                }),
            );

            const clientData = {
                ...client,
                behaviors,
                replacementPrograms,
                interventions,
            };

            return Success(clientData);
        }),
    );
