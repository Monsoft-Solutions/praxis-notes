import { endpoints } from '@api/providers/server';

// queries
import { getReplacementPrograms } from './get-replacement-programs.query';

// mutations
import { createReplacementProgram } from './create-replacement-program.mutation';

// subscriptions

export const replacementProgram = endpoints({
    // queries
    getReplacementPrograms,

    // mutations
    createReplacementProgram,

    // subscriptions
});
