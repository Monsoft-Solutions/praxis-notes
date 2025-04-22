import { endpoints } from '@api/providers/server';

// queries
import { getAntecedents } from './get-antecedents.query';

// mutations
import { createAntecedent } from './create-antecedent.mutation';
import { updateAntecedent } from './update-antecedent.mutation';

// subscriptions

export const antecedent = endpoints({
    // queries
    getAntecedents,

    // mutations
    createAntecedent,
    updateAntecedent,

    // subscriptions
});
