import { tool } from 'ai';
import { z } from 'zod';
import { getClientAbaData } from '@src/client/providers';

/**
 * Get client ABA data for the client id
 *
 * It doesn't include data related to the sessions.
 *
 *
 * @param clientId - The client id to get client data for
 * @returns The client data for the client id
 */
export const getClientDataTool = tool({
    parameters: z.object({
        clientId: z.string().describe('The client id to get client data for'),
    }),
    description:
        'Get the ABA related data for a client. This includes: behaviors, replacement programs, interventions, and other ABA related data.',
    execute: async ({ clientId }) => {
        console.log('Executing getClientDataTool', clientId);
        const clientData = await getClientAbaData(clientId);
        return clientData;
    },
});
