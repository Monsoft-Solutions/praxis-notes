import { Seed } from '@seed/types';

import { authenticationTable, userTable } from '../db';
import { userRoleTable } from '@guard/db';

const _partialSchema = { userTable, authenticationTable, userRoleTable };

// User seeds
export const userSeed: Seed<typeof _partialSchema> = (f) => ({
    userTable: {
        count: 100,
        columns: {
            id: f.uuid(),
            firstName: f.firstName(),
            lastName: f.lastName(),
            bookmarked: f.valuesFromArray({ values: [true] }),
        },

        with: {
            authenticationTable: 1,
            userRoleTable: [
                { count: 1, weight: 0.25 },
                { count: 2, weight: 0.25 },
                { count: 3, weight: 0.25 },
                { count: 4, weight: 0.25 },
            ],
        },
    },
});
