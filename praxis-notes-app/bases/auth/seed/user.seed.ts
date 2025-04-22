import { eq } from 'drizzle-orm';
import { db } from '@db/providers/server/db-client.provider';

import { userTable } from '../db';

import { testUser } from './constants';

// user seeds
export const userSeed = async () => {
    console.log('seeding test user...');

    const user = await db.query.userTable.findFirst({
        where: eq(userTable.id, testUser.id),
    });

    if (user) {
        console.log('test user already exists');
        return;
    }

    await db.insert(userTable).values(testUser);

    console.log('test user seeded');
};
