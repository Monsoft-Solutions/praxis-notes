import { db } from '@db/providers/server/db-client.provider';

import { promptTypeTable } from '../db';

import { inArray } from 'drizzle-orm';

import { promptTypeData } from './constant';

export const promptTypeSeed = async () => {
    console.log('seeding prompt types...');

    // Get all IDs from the seed data
    const seedIds = promptTypeData.map((item) => item.id);

    // Fetch all existing prompt types in a single query
    const existingPromptTypes = await db.query.promptTypeTable.findMany({
        where: inArray(promptTypeTable.id, seedIds),
    });

    // Create a set of existing IDs for fast lookup
    const existingIds = new Set(existingPromptTypes.map((item) => item.id));

    // Filter prompt types that need to be inserted
    const newPromptTypes = promptTypeData.filter(
        (item) => !existingIds.has(item.id),
    );

    if (newPromptTypes.length > 0) {
        // Perform a batch insert for all new prompt types
        await db.insert(promptTypeTable).values(newPromptTypes);
    }

    // Log existing items
    existingPromptTypes.forEach((item) => {
        console.log(`Prompt type ${item.id} already exists`);
    });

    console.log('prompt types seeded');
};
