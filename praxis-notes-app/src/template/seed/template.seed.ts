import { Seed } from '@seed/types';

import { templateTable } from '../db';

// partial schema containing only the template table
const _partialSchema = { templateTable };

// template table seed
export const templateSeed: Seed<typeof _partialSchema> = (f) => ({
    templateTable: {
        // number of templates to create
        count: 5,

        // refined columns
        columns: {
            id: f.uuid(),
            name: f.lastName(),
        },
    },
});
