import { endpoints } from '@api/providers/server';

// queries
import { getClients } from './get-clients.query';
import { getClient } from './get-client.query';

// mutations
import { createClient } from './create-client.mutation';
import { updateClient } from './update-client.mutation';
import { updateClientBehaviors } from './update-client-behaviors.mutation';
import { updateClientReplacementPrograms } from './update-client-replacement-programs.mutation';
import { updateClientInterventions } from './update-client-interventions.mutation';
import { deleteClient } from './delete-client.mutation';

// subscriptions

export const client = endpoints({
    // queries
    getClients,
    getClient,

    // mutations
    createClient,
    updateClient,
    updateClientBehaviors,
    updateClientReplacementPrograms,
    updateClientInterventions,
    deleteClient,

    // subscriptions
});
