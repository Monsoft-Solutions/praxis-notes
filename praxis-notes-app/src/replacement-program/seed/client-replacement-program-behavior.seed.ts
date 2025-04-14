import { Seed } from '@seed/types';

import { clientReplacementProgramBehaviorTable } from '../db';

const _partialSchema = { clientReplacementProgramBehaviorTable };

export const clientReplacementProgramBehaviorSeed: Seed<
    typeof _partialSchema
> = () => ({
    clientReplacementProgramBehaviorTable: {
        count: 1,
    },
});
