import { tool } from 'ai';
import { z } from 'zod';

import { db } from '@db/providers/server';
import { eq, isNull, or } from 'drizzle-orm';
import { catchError } from '@errors/utils/catch-error.util';

/**
 * Get interventions available for a given organization.
 *
 * Returns interventions that are either global (organizationId is null)
 * or specific to the given organization.
 *
 * @param organizationId - The organization id to get interventions for
 * @returns The list of interventions with id and name
 */
export const listInterventionsTool = tool({
    parameters: z.object({
        organizationId: z.string(),
    }),
    description:
        'List the interventions that are available in the system for a given organization.',
    execute: async (input) => {
        const { organizationId } = input;

        console.log('Listing interventions', input);

        // get the interventions for the organization (including global ones)
        const { data: interventionRecords, error } = await catchError(
            db.query.interventionTable.findMany({
                where: (record) =>
                    or(
                        eq(record.organizationId, organizationId),
                        isNull(record.organizationId),
                    ),
            }),
        );

        if (error) {
            throw new Error('Failed to fetch interventions');
        }

        const interventions = interventionRecords.map((record) => ({
            id: record.id,
            name: record.name,
        }));

        return interventions;
    },
});
