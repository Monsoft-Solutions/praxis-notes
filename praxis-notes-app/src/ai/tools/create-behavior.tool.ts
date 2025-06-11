import { tool } from 'ai';
import { z } from 'zod';

import { createBehaviorProvider } from '@src/behavior/providers/create-behavior.provider';

/**
 * Create a new behavior for a given organization.
 *
 * Creates a behavior with the provided name and description
 * associated with the specified organization.
 *
 * @param name - The name of the behavior
 * @param description - The description of the behavior
 * @param organizationId - The organization id to create the behavior for
 * @returns The created behavior with id
 */
export const createBehaviorTool = tool({
    parameters: z.object({
        name: z.string(),
        description: z.string(),
        organizationId: z.string(),
    }),
    description:
        'Create a new behavior for a given organization with a name and description.',
    execute: async (input) => {
        const { name, description, organizationId } = input;

        console.log('Creating behavior', input);

        // create the behavior using the provider
        const result = await createBehaviorProvider({
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
            throw new Error('A behavior with this name already exists');
        }

        throw new Error('Failed to create behavior');
    },
});
