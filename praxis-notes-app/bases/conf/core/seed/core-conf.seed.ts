import { Seed } from '@seed/types';

import { coreConfTable } from '../db';

const _partialSchema = { coreConfTable };

// Core configuration seeds
export const coreConfSeed: Seed<typeof _partialSchema> = (f) => ({
    coreConfTable: {
        count: 1,
        columns: {
            id: f.uuid(),
            name: f.companyName(),
        },
    },
});
