import { db } from '@db/providers/server/db-client.provider';

import { teachingProcedureTable } from '../db';

import { eq } from 'drizzle-orm';

import { teachingProcedureData } from './constant';

export const teachingProcedureSeed = async () => {
    console.log('seeding teaching procedures...');

    // check if teaching procedures already exist
    await Promise.all(
        teachingProcedureData.map(async (item) => {
            const existingTeachingProcedure =
                await db.query.teachingProcedureTable.findFirst({
                    where: eq(teachingProcedureTable.id, item.id),
                });

            if (existingTeachingProcedure) {
                // Log if the item already exists and skip insertion
                return;
            }

            // Insert the new item
            await db.insert(teachingProcedureTable).values(item);
        }),
    );

    console.log('teaching procedures seeded');
};
