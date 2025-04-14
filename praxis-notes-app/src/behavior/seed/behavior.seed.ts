import { Seed } from '@seed/types';

import { behaviorTable } from '../db';

const _partialSchema = { behaviorTable };

export const behaviorSeed: Seed<typeof _partialSchema> = () => ({
    behaviorTable: {
        count: 1,
    },
});
