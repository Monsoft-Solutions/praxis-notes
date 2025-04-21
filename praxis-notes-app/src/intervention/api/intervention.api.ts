import { endpoints } from '@api/providers/server';

// queries
import { getInterventions } from './get-interventions.query';
import { getClientInterventions } from './get-client-interventions.query';

// mutations
import { createIntervention } from './create-intervention.mutation';
import { updateIntervention } from './update-intervention.mutation';

// subscriptions

export const intervention = endpoints({
    // queries
    getInterventions,
    getClientInterventions,

    // mutations
    createIntervention,
    updateIntervention,

    // subscriptions
});
