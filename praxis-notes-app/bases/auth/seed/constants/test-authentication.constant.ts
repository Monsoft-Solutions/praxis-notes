import { z } from 'zod';

import { InferInsertModel } from 'drizzle-orm';

import bcrypt from 'bcryptjs';

import { authenticationTable } from '@db/db.tables';

import { testUser } from './test-user.constant';

const seedPassword = z.string().parse(process.env.MSS_TEST_USER_PASSWORD);

const seedPasswordHash = await bcrypt.hash(seedPassword, 10);

export const testAuthentication: InferInsertModel<typeof authenticationTable> =
    {
        id: 'test-authentication-id',
        userId: testUser.id,
        email: 'test@email.com',
        password: seedPasswordHash,
    };
