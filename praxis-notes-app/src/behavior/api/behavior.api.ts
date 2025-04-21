import { endpoints } from '@api/providers/server';

// queries
import { getBehaviors } from './get-behaviors.query';
import { getClientBehaviors } from './get-client-behaviors.query';

// mutations
import { createBehavior } from './create-behavior.mutation';
import { updateBehavior } from './update-behavior.mutation';
// subscriptions

export const behavior = endpoints({
    // queries
    getBehaviors,
    getClientBehaviors,

    // mutations
    createBehavior,
    updateBehavior,
    // subscriptions
});
