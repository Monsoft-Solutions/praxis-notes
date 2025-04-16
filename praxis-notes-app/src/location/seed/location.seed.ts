import { Seed } from '@seed/types';

import { locationTable } from '../db';

const _partialSchema = { locationTable };

export const locationSeed: Seed<typeof _partialSchema> = () => ({
    locationTable: {
        count: 9, // Common therapy locations: Home, School, Therapy center, Daycare, Clinic, Community center, Park, Library, Other
    },
});
