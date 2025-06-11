import { tool } from 'ai';
import { z } from 'zod';

import { createAntecedentProvider } from '@src/antecedent/providers/create-antecedent.provider';

/**
 * Create a new antecedent for a given organization.
 *
 * Creates an antecedent with the provided name
 * associated with the specified organization.
 *
 * @param name - The name of the antecedent
 * @param organizationId - The organization id to create the antecedent for
 * @returns The created antecedent with id
 */
export const createAntecedentTool = tool({
    parameters: z.object({
        name: z.string(),
        organizationId: z.string(),
    }),
    description:
        'Create a new antecedent for a given organization with a name.',
    execute: async (input) => {
        const { name, organizationId } = input;

        console.log('Creating antecedent', input);

        // create the antecedent using the provider
        const result = await createAntecedentProvider({
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
            throw new Error('An antecedent with this name already exists');
        }

        throw new Error('Failed to create antecedent');
    },
});
