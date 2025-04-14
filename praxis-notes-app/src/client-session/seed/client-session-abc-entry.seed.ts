import { Seed } from '@seed/types';

import { clientSessionAbcEntryTable } from '../db';

const _partialSchema = { clientSessionAbcEntryTable };

export const sessionAbcSeed: Seed<typeof _partialSchema> = () => ({
    clientSessionAbcEntryTable: {
        count: 1,
    },
});
