import { tool } from 'ai';
import { z } from 'zod';

import { db } from '@db/providers/server';
import { eq, isNull, or } from 'drizzle-orm';
import { catchError } from '@errors/utils/catch-error.util';

/**
 * Get reinforcers available for a given organization.
 *
 * Returns reinforcers that are either global (organizationId is null)
 * or specific to the given organization.
 *
 * @param organizationId - The organization id to get reinforcers for
 * @returns The list of reinforcers with id and name
 */
export const listReinforcersTool = tool({
    parameters: z.object({
        organizationId: z.string(),
    }),
    description:
        'List the reinforcers that are available in the system for a given organization.',
    execute: async (input) => {
        const { organizationId } = input;

        console.log('Listing reinforcers', input);

        // get the reinforcers for the organization (including global ones)
        const { data: reinforcerRecords, error } = await catchError(
            db.query.reinforcerTable.findMany({
                where: (record) =>
                    or(
                        eq(record.organizationId, organizationId),
                        isNull(record.organizationId),
                    ),
            }),
        );

        if (error) {
            throw new Error('Failed to fetch reinforcers');
        }

        const reinforcers = reinforcerRecords.map((record) => ({
            id: record.id,
            name: record.name,
        }));

        return reinforcers;
    },
});
