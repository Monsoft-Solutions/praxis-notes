import { Seed } from '@seed/types';

import { organizationTable } from '../db';

const _partialSchema = { organizationTable };

// Organization seeds
export const organizationSeed: Seed<typeof _partialSchema> = (f) => ({
    organizationTable: {
        count: 3,
        columns: {
            id: f.uuid(),
            name: f.companyName(),
        },
    },
});
