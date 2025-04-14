import { endpoints } from '@api/providers/server';

// queries
import { getInterventions } from './get-interventions.query';

// mutations
import { createIntervention } from './create-intervention.mutation';

// subscriptions

export const intervention = endpoints({
    // queries
    getInterventions,

    // mutations
    createIntervention,

    // subscriptions
});
