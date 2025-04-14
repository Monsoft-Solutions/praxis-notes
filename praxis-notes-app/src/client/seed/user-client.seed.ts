import { Seed } from '@seed/types';

import { userClientTable } from '../db';

const _partialSchema = { userClientTable };

export const userClientSeed: Seed<typeof _partialSchema> = () => ({
    userClientTable: {
        count: 1,
    },
});
