import { db } from '@db/providers/server/db-client.provider';

import { reinforcerTable } from '../db'; // Updated import

import { reinforcerData } from './constant'; // Updated import
import { eq } from 'drizzle-orm';

export const reinforcerSeed = async () => {
    // Renamed function
    console.log('seeding reinforcers...'); // Updated log

    // check if reinforcers already exist
    await Promise.all(
        reinforcerData.map(async ({ id, name }) => {
            // Updated variable
            const existingReinforcer = await db.query.reinforcerTable.findFirst(
                // Updated query
                {
                    where: eq(reinforcerTable.id, id), // Updated table
                },
            );

            if (existingReinforcer) {
                return;
            }

            await db.insert(reinforcerTable).values({
                // Updated table
                id,
                organizationId: null,
                name,
            });
        }),
    );

    console.log('reinforcers seeded'); // Updated log
};
