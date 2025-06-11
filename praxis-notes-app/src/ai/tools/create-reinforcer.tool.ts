import { tool } from 'ai';
import { z } from 'zod';

import { createReinforcerProvider } from '@src/reinforcer/providers/create-reinforcer.provider';

/**
 * Create a new reinforcer for a given organization.
 *
 * Creates a reinforcer with the provided name
 * associated with the specified organization.
 *
 * @param name - The name of the reinforcer
 * @param organizationId - The organization id to create the reinforcer for
 * @returns The created reinforcer with id
 */
export const createReinforcerTool = tool({
    parameters: z.object({
        name: z.string(),
        organizationId: z.string(),
    }),
    description:
        'Create a new reinforcer for a given organization with a name.',
    execute: async (input) => {
        const { name, organizationId } = input;

        console.log('Creating reinforcer', input);

        // create the reinforcer using the provider
        const result = await createReinforcerProvider({
            name,
            organizationId,
        });

        if (result.error === null) {
            return {
                id: result.data.id,
                name,
                organizationId,
            };
        }

        // handle different error types
        if (result.error === 'DUPLICATE') {
            throw new Error('A reinforcer with this name already exists');
        }

        throw new Error('Failed to create reinforcer');
    },
});
