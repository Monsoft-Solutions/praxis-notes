import * as appUserCreditsRaw from '@app/credits/user';

import { Conf } from '@conf/types';

// full app rate configuration
export const appUserCredits = Object.entries(appUserCreditsRaw).reduce(
    (acc, [, moduleUserCredits]) => ({
        ...acc,
        ...moduleUserCredits,
    }),
    {},
) as Conf<typeof appUserCreditsRaw>;
