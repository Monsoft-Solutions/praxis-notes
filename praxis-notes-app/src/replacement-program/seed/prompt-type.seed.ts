import { db } from '@db/providers/server/db-client.provider';

import { promptTypeTable } from '../db';

import { eq } from 'drizzle-orm';

import { promptTypeData } from './constant';

export const promptTypeSeed = async () => {
    console.log('seeding prompt types...');

    // check if prompt types already exist
    await Promise.all(
        promptTypeData.map(async (item) => {
            const existingPromptType = await db.query.promptTypeTable.findFirst(
                {
                    where: eq(promptTypeTable.id, item.id),
                },
            );

            if (existingPromptType) {
                // Item already exists, skip insertion (no console.log as per user preference)
                return;
            }

            // Insert the new item
            await db.insert(promptTypeTable).values(item);
        }),
    );

    console.log('prompt types seeded');
};
