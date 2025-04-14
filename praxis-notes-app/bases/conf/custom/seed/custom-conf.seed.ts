import { Seed } from '@seed/types';

import { customConfTable } from '../db';

const _partialSchema = { customConfTable };

export const customConfSeed: Seed<typeof _partialSchema> = (f) => ({
    customConfTable: {
        count: 1,
        columns: {
            id: f.uuid(),
            name: f.companyName(),
        },
    },
});
