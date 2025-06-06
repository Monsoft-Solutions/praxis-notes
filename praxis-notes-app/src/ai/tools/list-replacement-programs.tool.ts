import { tool } from 'ai';
import { z } from 'zod';

import { db } from '@db/providers/server';
import { eq, isNull, or } from 'drizzle-orm';
import { catchError } from '@errors/utils/catch-error.util';

/**
 * Get replacement programs available for a given organization.
 *
 * Returns replacement programs that are either global (organizationId is null)
 * or specific to the given organization.
 *
 * @param organizationId - The organization id to get replacement programs for
 * @returns The list of replacement programs with id and name
 */
export const listReplacementProgramsTool = tool({
    parameters: z.object({
        organizationId: z.string(),
    }),
    description:
        'List the replacement programs that are available in the system for a given organization.',
    execute: async (input) => {
        const { organizationId } = input;

        console.log('Listing replacement programs', input);

        // get the replacement programs for the organization (including global ones)
        const { data: replacementProgramRecords, error } = await catchError(
            db.query.replacementProgramTable.findMany({
                where: (record) =>
                    or(
                        eq(record.organizationId, organizationId),
                        isNull(record.organizationId),
                    ),
            }),
        );

        if (error) {
            throw new Error('Failed to fetch replacement programs');
        }

        const replacementPrograms = replacementProgramRecords.map((record) => ({
            id: record.id,
            name: record.name,
        }));

        return replacementPrograms;
    },
});
