import { db } from '@db/providers/server/db-client.provider';

import { behaviorTable } from '../db';

import { behaviorData } from './constant';
import { eq } from 'drizzle-orm';

export const behaviorSeed = async () => {
    console.log('seeding behaviors...');

    // check if behaviors already exist
    await Promise.all(
        behaviorData.map(async ({ id, name, description }) => {
            const existingBehavior = await db.query.behaviorTable.findFirst({
                where: eq(behaviorTable.id, id),
            });

            if (existingBehavior) {
                console.log(`behavior ${name} already exist`);
                return;
            }

            await db.insert(behaviorTable).values({
                id,
                organizationId: null,
                name,
                description,
            });
        }),
    );

    console.log('behaviors seeded');
};
