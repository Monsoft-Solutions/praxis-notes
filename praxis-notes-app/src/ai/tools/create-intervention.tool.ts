import { tool } from 'ai';
import { z } from 'zod';

import { createInterventionProvider } from '@src/intervention/providers/create-intervention.provider';

/**
 * Create a new intervention for a given organization.
 *
 * Creates an intervention with the provided name and description
 * associated with the specified organization.
 *
 * @param name - The name of the intervention
 * @param description - The description of the intervention
 * @param organizationId - The organization id to create the intervention for
 * @returns The created intervention with id
 */
export const createInterventionTool = tool({
    parameters: z.object({
        name: z.string(),
        description: z.string(),
        organizationId: z.string(),
    }),
    description:
        'Create a new intervention for a given organization with a name and description.',
    execute: async (input) => {
        const { name, description, organizationId } = input;

        console.log('Creating intervention', input);

        // create the intervention using the provider
        const result = await createInterventionProvider({
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
            throw new Error('An intervention with this name already exists');
        }

        throw new Error('Failed to create intervention');
    },
});
