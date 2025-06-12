import { db } from '@db/providers/server/db-client.provider';

import { replacementProgramTable } from '../db';

import { replacementProgramData } from './constant';
import { eq } from 'drizzle-orm';

export const replacementProgramSeed = async () => {
    console.log('seeding replacement programs...');

    // check if replacement programs already exist
    await Promise.all(
        replacementProgramData.map(async ({ id, name, description }) => {
            const existingReplacementProgram =
                await db.query.replacementProgramTable.findFirst({
                    where: eq(replacementProgramTable.id, id),
                });

            if (existingReplacementProgram) {
                return;
            }

            await db.insert(replacementProgramTable).values({
                id,
                organizationId: null,
                name,
                description,
            });
        }),
    );

    console.log('replacement programs seeded');
};
