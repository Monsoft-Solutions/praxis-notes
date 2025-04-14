import { Seed } from '@seed/types';

import { roleTable } from '../db';

import { roles } from '@guard/constants';

// partial db schema containing only the role table
const _partialSchema = { roleTable };

export const roleSeed: Seed<typeof _partialSchema> = (f) => ({
    roleTable: {
        // number of role db records to create
        // one per defined role
        count: roles.length,

        // columns to create
        columns: {
            // id of the role
            id: f.uuid(),

            // description of the role
            description: f.jobTitle(),

            // name of the role
            name: f.valuesFromArray({
                values: roles,
            }),
        },
    },
});
