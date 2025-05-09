import { endpoints } from '@api/providers/server';

// queries
import { getReinforcers } from './get-reinforcers.query';

// mutations
import { createReinforcer } from './create-reinforcer.mutation';
import { updateReinforcer } from './update-reinforcer.mutation';

// subscriptions

export const reinforcerApi = endpoints({
    // queries
    getReinforcers,

    // mutations
    createReinforcer,
    updateReinforcer,

    // subscriptions
});
