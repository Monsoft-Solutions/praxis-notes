import { seeder } from './seeder';

import * as schema from '@db/db.tables';

import { reset } from 'drizzle-seed';

import * as seeds from './seeds';

// function used to seed the db
export async function seedDb() {
    console.log('seeding DB...');

    console.log('resetting DB...');
    await reset(seeder, schema);
    console.log('DB reset');

    for (const seed of Object.values(seeds)) {
        await seed();
    }

    console.log('DB seeded !');
}
