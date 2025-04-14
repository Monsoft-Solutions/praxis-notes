import { Seed } from '@seed/types';

import { clientBehaviorTable } from '../db';

const _partialSchema = { clientBehaviorTable };

export const clientBehaviorSeed: Seed<typeof _partialSchema> = () => ({
    clientBehaviorTable: {
        count: 1,
    },
});
