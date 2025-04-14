import { Seed } from '@seed/types';

import { sessionTable } from '../db';

const _partialSchema = { sessionTable };

// Session seeds
export const sessionSeed: Seed<typeof _partialSchema> = () => ({
    sessionTable: {
        count: 0,
    },
});
