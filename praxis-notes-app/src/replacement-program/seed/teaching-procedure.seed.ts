import { db } from '@db/providers/server/db-client.provider';

import { teachingProcedureTable } from '../db';

import { inArray } from 'drizzle-orm';

import { teachingProcedureData } from './constant';

export const teachingProcedureSeed = async () => {
    console.log('seeding teaching procedures...');

    // Get all IDs from the seed data
    const seedIds = teachingProcedureData.map((item) => item.id);

    // Fetch all existing prompt types in a single query
    const existingPromptTypes = await db.query.teachingProcedureTable.findMany({
        where: inArray(teachingProcedureTable.id, seedIds),
    });

    // Create a set of existing IDs for fast lookup
    const existingIds = new Set(existingPromptTypes.map((item) => item.id));

    // Filter prompt types that need to be inserted
    const newPromptTypes = teachingProcedureData.filter(
        (item) => !existingIds.has(item.id),
    );

    if (newPromptTypes.length > 0) {
        // Perform a batch insert for all new prompt types
        await db.insert(teachingProcedureTable).values(newPromptTypes);
    }

    // Log existing items
    existingPromptTypes.forEach((item) => {
        console.log(`Teaching procedure ${item.id} already exists`);
    });

    console.log('teaching procedures seeded');
};
