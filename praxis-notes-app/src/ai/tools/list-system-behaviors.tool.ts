import { tool } from 'ai';
import { z } from 'zod';

import { db } from '@db/providers/server';
import { eq, isNull, or } from 'drizzle-orm';
import { catchError } from '@errors/utils/catch-error.util';

/**
 * Get system behaviors available for a given organization.
 *
 * Returns behaviors that are either global (organizationId is null)
 * or specific to the given organization.
 *
 * @param organizationId - The organization id to get behaviors for
 * @returns The list of behaviors with id and name
 */
export const listSystemBehaviorsTool = tool({
    parameters: z.object({
        organizationId: z.string(),
    }),
    description:
        'List the behaviors that are available in the system for a given organization.',
    execute: async (input) => {
        const { organizationId } = input;

        console.log('Listing system behaviors', input);

        // get the behaviors for the organization (including global ones)
        const { data: behaviorRecords, error } = await catchError(
            db.query.behaviorTable.findMany({
                where: (record) =>
                    or(
                        eq(record.organizationId, organizationId),
                        isNull(record.organizationId),
                    ),
            }),
        );

        if (error) {
            throw new Error('Failed to fetch behaviors');
        }

        const behaviors = behaviorRecords.map((record) => ({
            id: record.id,
            name: record.name,
        }));

        return behaviors;
    },
});
