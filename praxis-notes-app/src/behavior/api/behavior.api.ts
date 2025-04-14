import { endpoints } from '@api/providers/server';

// queries
import { getBehaviors } from './get-behaviors.query';

// mutations
import { createBehavior } from './create-behavior.mutation';

// subscriptions

export const behavior = endpoints({
    // queries
    getBehaviors,

    // mutations
    createBehavior,

    // subscriptions
});
