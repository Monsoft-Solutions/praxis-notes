import { db } from '@db/providers/server/db-client.provider';

import { interventionTable } from '../db';

import { interventionData } from './constant';
import { eq } from 'drizzle-orm';

export const interventionSeed = async () => {
    console.log('seeding interventions...');

    // check if interventions already exist
    await Promise.all(
        interventionData.map(async ({ id, name, description, category }) => {
            const existingIntervention =
                await db.query.interventionTable.findFirst({
                    where: eq(interventionTable.id, id),
                });

            if (existingIntervention) {
                return;
            }

            await db.insert(interventionTable).values({
                id,
                organizationId: null,
                name,
                description,
                category,
            });
        }),
    );

    console.log('interventions seeded');
};
