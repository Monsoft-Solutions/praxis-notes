import { Seed } from '@seed/types';

import { antecedentTable } from '../db';

const _partialSchema = { antecedentTable };

export const antecedentSeed: Seed<typeof _partialSchema> = () => ({
    antecedentTable: {
        count: 1,
    },
});
