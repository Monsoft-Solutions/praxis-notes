import { z } from 'zod';

import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { eq, or } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

export const getClientInterventions = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),
        }),
    )
    .query(
        queryMutationCallback(async ({ input: { clientId } }) => {
            const { data: interventionRecords, error } = await catchError(
                db.query.clientInterventionTable.findMany({
                    where: (record) => or(eq(record.clientId, clientId)),
                    with: {
                        intervention: true,
                        behaviors: {
                            with: {
                                clientBehavior: true,
                            },
                        },
                    },
                }),
            );

            if (error) return Error();

            const interventions = interventionRecords.map(
                (clientIntervention) => {
                    const { id, name, description, organizationId } =
                        clientIntervention.intervention;

                    return {
                        id,
                        name,
                        description,
                        isCustom: organizationId !== null,
                        clientInterventionId: clientIntervention.id,
                        behaviors: clientIntervention.behaviors.map(
                            ({ clientBehavior }) => clientBehavior.behaviorId,
                        ),
                    };
                },
            );

            return Success(interventions);
        }),
    );
