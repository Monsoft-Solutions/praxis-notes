import { listClients } from '@src/client/providers';
import { tool } from 'ai';
import { z } from 'zod';

/**
 * Get available clients for the user
 *
 * @param userId - The user id to get available clients for
 * @returns The available clients for the user
 */
export const listAvailableClientsTool = tool({
    parameters: z.object({
        userId: z.string().describe('The user id to get available clients for'),
    }),
    description: 'Get available clients for the user',
    execute: async ({ userId }) => {
        console.log('Executing listAvailableClientsTool', userId);
        const clients = await listClients(userId);
        return clients;
    },
});
