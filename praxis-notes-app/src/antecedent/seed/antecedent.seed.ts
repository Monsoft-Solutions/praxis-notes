import { db } from '@db/providers/server/db-client.provider';

import { antecedentTable } from '../db';

import { antecedentData } from './constant';
import { eq } from 'drizzle-orm';

export const antecedentSeed = async () => {
    console.log('seeding antecedents...');

    // check if antecedents already exist
    await Promise.all(
        antecedentData.map(async ({ id, name }) => {
            const existingAntecedent = await db.query.antecedentTable.findFirst(
                {
                    where: eq(antecedentTable.id, id),
                },
            );

            if (existingAntecedent) {
                console.log(`antecedent ${name} already exist`);
                return;
            }

            await db.insert(antecedentTable).values({
                id,
                organizationId: null,
                name,
            });
        }),
    );

    console.log('antecedents seeded');
};
