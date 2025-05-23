import { tool } from 'ai';
import { clientFormDataSchema } from '@src/client/schemas';

import { v4 as uuidv4 } from 'uuid';
import { createClient as createClientProvider } from '@src/client/providers/server';

/**
 * Get client ABA data for the client id
 *
 * It doesn't include data related to the sessions.
 *
 *
 * @param clientId - The client id to get client data for
 * @returns The client data for the client id
 */
export const createClientTool = tool({
    parameters: clientFormDataSchema,
    description:
        'Get the ABA related data for a client. This includes: behaviors, replacement programs, interventions, and other ABA related data.',
    execute: async (input) => {
        const {
            firstName,
            lastName,
            gender,
            behaviors,
            replacementPrograms,
            interventions,
        } = input;

        console.log('Creating client', input);

        const clientId = uuidv4();

        const { error } = await createClientProvider({
            clientId,
            user: {
                id: '1',
                organizationId: '1',
            },
            clientFormData: {
                firstName,
                lastName,
                gender,
                behaviors,
                replacementPrograms,
                interventions,
            },

            isDraft: false,
        });

        if (error) {
            return error;
        }

        return `Client created successfully with id ${clientId}`;
    },
});
