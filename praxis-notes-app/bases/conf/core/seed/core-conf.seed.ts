import { db } from '@db/providers/server/db-client.provider';
import { eq } from 'drizzle-orm';

import { coreConfTable } from '../db';
import { coreConfigData } from './constants';

// Core configuration seeds
export const coreConfSeed = async () => {
    const existingConfRow = await db.query.coreConfTable.findFirst();

    if (!existingConfRow) {
        await db.insert(coreConfTable).values(coreConfigData);
    } else {
        // If a row exists, update it with all values from coreConfigData.
        // Use the ID of the fetched row to ensure we're updating the correct one.
        await db
            .update(coreConfTable)
            .set(coreConfigData)
            .where(eq(coreConfTable.id, existingConfRow.id));
    }
};
