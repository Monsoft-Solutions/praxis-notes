import { eq } from 'drizzle-orm';
import { db } from '@db/providers/server/db-client.provider';

import { authenticationTable } from '../db';

import { testAuthentication, testUser } from './constants';

// authentication seeds
export const authenticationSeed = async () => {
    console.log('seeding test authentication...');

    const authentication = await db.query.authenticationTable.findFirst({
        where: eq(authenticationTable.userId, testUser.id),
    });

    if (authentication) {
        console.log('test authentication already exists');
        return;
    }

    await db.insert(authenticationTable).values(testAuthentication);

    console.log('test authentication seeded');
};
