import * as appCore from '@app/conf/core';

import { AppConf } from '../../types';

// full app core configuration
export const appCoreConf = Object.entries(appCore).reduce(
    (acc, [, moduleConf]) => ({
        ...acc,
        ...moduleConf,
    }),
    {},
) as AppConf<typeof appCore>;
