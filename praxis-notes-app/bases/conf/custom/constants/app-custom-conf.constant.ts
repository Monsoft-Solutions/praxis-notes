import * as appCustom from '@app/conf/custom';

import { AppConf } from '@conf/types';

// full app custom configuration
export const appCustomConf = Object.entries(appCustom).reduce(
    (acc, [, moduleConf]) => ({
        ...acc,
        ...moduleConf,
    }),
    {},
) as AppConf<typeof appCustom>;
