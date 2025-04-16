import { endpoints } from '@api/providers/server';

// queries
import { getClients } from './get-clients.query';

// mutations
import { createClient } from './create-client.mutation';

// subscriptions

export const clientRouter = endpoints({
    // queries
    getClients,

    // mutations
    createClient,

    // subscriptions
});
