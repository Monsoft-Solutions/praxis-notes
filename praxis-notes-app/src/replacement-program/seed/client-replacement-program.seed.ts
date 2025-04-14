import { Seed } from '@seed/types';

import { clientReplacementProgramTable } from '../db';

const _partialSchema = { clientReplacementProgramTable };

export const clientReplacementProgramSeed: Seed<
    typeof _partialSchema
> = () => ({
    clientReplacementProgramTable: {
        count: 1,
    },
});
