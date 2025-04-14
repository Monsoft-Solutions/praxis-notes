import { Seed } from '@seed/types';

import { replacementProgramTable } from '../db';

const _partialSchema = { replacementProgramTable };

export const replacementProgramSeed: Seed<typeof _partialSchema> = () => ({
    replacementProgramTable: {
        count: 1,
    },
});
