import { InferInsertModel } from 'drizzle-orm';

import { db } from '@db/providers/server/db-client.provider';

import { templateTable } from '../db';

import { testUser } from '@auth/seed/constants';

const templateData: InferInsertModel<typeof templateTable>[] = [
    {
        id: 'template-id',
        name: 'template-name',
        creator: testUser.id,
        status: 'draft',
    },
];

// template table seed
export const templateSeed = async () => {
    await db.insert(templateTable).values(templateData);
};
