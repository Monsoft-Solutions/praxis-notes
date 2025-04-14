import { Seed } from '@seed/types';

import { roleTable, userRoleTable } from '../db';

// partial db schema containing only the role and user-role tables
const _partialSchema = { userRoleTable, roleTable };

export const userRoleSeed: Seed<typeof _partialSchema> = (f) => ({
    userRoleTable: {
        columns: {
            // id of the user-role assignment
            id: f.uuid(),
        },
    },
});
