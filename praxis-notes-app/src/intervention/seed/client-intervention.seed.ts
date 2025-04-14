import { Seed } from '@seed/types';

import { clientInterventionTable } from '../db';

const _partialSchema = { clientInterventionTable };

export const clientInterventionSeed: Seed<typeof _partialSchema> = () => ({
    clientInterventionTable: {
        count: 1,
    },
});
