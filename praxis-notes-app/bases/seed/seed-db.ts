import { seed } from 'drizzle-seed';

import { seeder } from './seeder';

import * as schema from '../db/db.tables';

import * as nestedSeeds from './seeds';

import { SeedsGenerator } from './types';

// full refinement function combining all seeds
const refinement = (f: SeedsGenerator) =>
    Object.fromEntries(
        Object.entries(nestedSeeds)
            .map(([, value]) => Object.entries(value(f)))
            .flat(),
    );

// function used to seed the db
export async function seedDb() {
    console.log('Seeding DB');

    await seed(seeder, schema).refine(refinement);

    console.log('DB seeded !');
}
