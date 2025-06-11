import { tool } from 'ai';
import { z } from 'zod';

import { createReplacementProgramProvider } from '@src/replacement-program/providers/create-replacement-program.provider';

/**
 * Create a new replacement program for a given organization.
 *
 * Creates a replacement program with the provided name and description
 * associated with the specified organization.
 *
 * @param name - The name of the replacement program
 * @param description - The description of the replacement program
 * @param organizationId - The organization id to create the replacement program for
 * @returns The created replacement program with id
 */
export const createReplacementProgramTool = tool({
    parameters: z.object({
        name: z.string(),
        description: z.string(),
        organizationId: z.string(),
    }),
    description:
        'Create a new replacement program for a given organization with a name and description.',
    execute: async (input) => {
        const { name, description, organizationId } = input;

        console.log('Creating replacement program', input);

        // create the replacement program using the provider
        const result = await createReplacementProgramProvider({
            name,
            description,
            organizationId,
        });

        if (result.error === null) {
            return {
                id: result.data.id,
                name,
                description,
                organizationId,
            };
        }

        // handle different error types
        if (result.error === 'DUPLICATE') {
            throw new Error(
                'A replacement program with this name already exists',
            );
        }

        throw new Error('Failed to create replacement program');
    },
});
