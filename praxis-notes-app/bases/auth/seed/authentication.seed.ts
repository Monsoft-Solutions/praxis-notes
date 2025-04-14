import bcrypt from 'bcryptjs';

import { Seed } from '@seed/types';

import { authenticationTable } from '../db';

const _partialSchema = { authenticationTable };

const seedPassword = '@demo1';

const passwordHash = await bcrypt.hash(seedPassword, 10);

// Authentication seeds
export const authenticationSeed: Seed<typeof _partialSchema> = (f) => ({
    authenticationTable: {
        columns: {
            id: f.uuid(),
            email: f.email(),
            password: f.valuesFromArray({ values: [passwordHash] }),
        },
    },
});
