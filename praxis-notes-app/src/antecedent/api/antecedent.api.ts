import { endpoints } from '@api/providers/server';

// queries
import { getAntecedents } from './get-antecedents.query';

// mutations
import { createAntecedent } from './create-antecedent.mutation';

// subscriptions

export const antecedent = endpoints({
    // queries
    getAntecedents,

    // mutations
    createAntecedent,

    // subscriptions
});
