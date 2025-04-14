import { Seed } from '@seed/types';

import { clientTable } from '../db';

const _partialSchema = { clientTable };

export const clientSeed: Seed<typeof _partialSchema> = () => ({
    clientTable: {
        count: 1,
    },
});
