import { Seed } from '@seed/types';

import { clientSessionTable } from '../db';

const _partialSchema = { clientSessionTable };

export const clientSessionSeed: Seed<typeof _partialSchema> = (f) => ({
    clientSessionTable: {
        count: 1,

        columns: {
            startTime: f.time(),
            endTime: f.time(),
        },
    },
});
