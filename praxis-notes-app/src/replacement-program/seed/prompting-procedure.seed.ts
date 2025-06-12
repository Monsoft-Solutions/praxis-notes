import { db } from '@db/providers/server/db-client.provider';

import { promptingProcedureTable } from '../db';

import { eq } from 'drizzle-orm';

import { promptingProcedureData } from './constant';

export const promptingProcedureSeed = async () => {
    console.log('seeding prompting procedures...');

    // check if prompting procedures already exist
    await Promise.all(
        promptingProcedureData.map(async (item) => {
            const existingPromptingProcedure =
                await db.query.promptingProcedureTable.findFirst({
                    where: eq(promptingProcedureTable.id, item.id),
                });

            if (existingPromptingProcedure) {
                // Item already exists, skip insertion (no console.log as per user preference)
                return;
            }

            // Insert the new item
            await db.insert(promptingProcedureTable).values(item);
        }),
    );

    console.log('prompting procedures seeded');
};
