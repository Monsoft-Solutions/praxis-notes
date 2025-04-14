import { Seed } from '@seed/types';

import { clientBehaviorInterventionTable } from '../db';

const _partialSchema = { clientBehaviorInterventionTable };

export const clientBehaviorInterventionSeed: Seed<
    typeof _partialSchema
> = () => ({
    clientBehaviorInterventionTable: {
        count: 1,
    },
});
