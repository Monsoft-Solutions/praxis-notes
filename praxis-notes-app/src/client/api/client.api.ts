import { endpoints } from '@api/providers/server';

// queries
import { getClients } from './get-clients.query';
import { getClient } from './get-client.query';

// mutations
import { createClient } from './create-client.mutation';
import { updateClient } from './update-client.mutation';

// subscriptions

export const client = endpoints({
    // queries
    getClients,
    getClient,

    // mutations
    createClient,
    updateClient,

    // subscriptions
});
