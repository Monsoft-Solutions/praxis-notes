import { db } from '@db/providers/server/db-client.provider';

import { promptingProcedureTable } from '../db';

import { inArray } from 'drizzle-orm';

import { promptingProcedureData } from './constant';

export const promptingProcedureSeed = async () => {
    console.log('seeding prompting procedures...');

    // Get all IDs from the seed data
    const seedIds = promptingProcedureData.map((item) => item.id);

    // Fetch all existing prompt types in a single query
    const existingPromptTypes = await db.query.promptingProcedureTable.findMany(
        {
            where: inArray(promptingProcedureTable.id, seedIds),
        },
    );

    // Create a set of existing IDs for fast lookup
    const existingIds = new Set(existingPromptTypes.map((item) => item.id));

    // Filter prompt types that need to be inserted
    const newPromptTypes = promptingProcedureData.filter(
        (item) => !existingIds.has(item.id),
    );

    if (newPromptTypes.length > 0) {
        // Perform a batch insert for all new prompt types
        await db.insert(promptingProcedureTable).values(newPromptTypes);
    }

    // Log existing items
    existingPromptTypes.forEach((item) => {
        console.log(`Prompting procedure ${item.id} already exists`);
    });

    console.log('prompting procedures seeded');
};
