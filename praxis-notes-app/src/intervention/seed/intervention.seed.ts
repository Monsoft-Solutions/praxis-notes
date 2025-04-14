import { Seed } from '@seed/types';

import { interventionTable } from '../db';

const _partialSchema = { interventionTable };

export const interventionSeed: Seed<typeof _partialSchema> = () => ({
    interventionTable: {
        count: 1,
    },
});
