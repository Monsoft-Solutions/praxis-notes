import { endpoints } from '@api/providers/server';

// queries
import { getReplacementPrograms } from './get-replacement-programs.query';
import { getClientReplacementPrograms } from './get-client-replacement-programs.query';
import { getTeachingProcedures } from './get-teaching-procedures.query';
import { getPromptingProcedures } from './get-prompting-procedures.query';
import { getPromptTypes } from './get-prompt-types.query';

// mutations
import { createReplacementProgram } from './create-replacement-program.mutation';

// subscriptions

export const replacementProgram = endpoints({
    // queries
    getReplacementPrograms,
    getClientReplacementPrograms,
    getTeachingProcedures,
    getPromptingProcedures,
    getPromptTypes,

    // mutations
    createReplacementProgram,

    // subscriptions
});
