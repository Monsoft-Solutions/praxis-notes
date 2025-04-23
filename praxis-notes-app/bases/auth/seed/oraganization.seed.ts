import { eq } from 'drizzle-orm';
import { db } from '@db/providers/server/db-client.provider';

import { organizationTable } from '../db';

import { testOrganization } from './constants';

// organization seeds
export const organizationSeed = async () => {
    console.log('seeding test organization...');

    const organization = await db.query.organizationTable.findFirst({
        where: eq(organizationTable.id, testOrganization.id),
    });

    if (organization) {
        console.log('test organization already exists');
        return;
    }

    await db.insert(organizationTable).values(testOrganization);

    console.log('test organization seeded');
};
