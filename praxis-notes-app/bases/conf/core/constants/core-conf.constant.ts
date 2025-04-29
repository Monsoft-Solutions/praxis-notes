import { Conf } from '../../types';

import * as appCore from '@app/conf/core';
import * as emailCore from '../../../email/conf/core';
import * as loggerCore from '../../../logger/conf/core';

const modulesCoreConf = {
    ...appCore,
    ...emailCore,
    ...loggerCore,
};

// full app core configuration
export const coreConf = Object.entries(modulesCoreConf).reduce(
    (acc, [, moduleConf]) => ({
        ...acc,
        ...moduleConf,
    }),
    {},
) as Conf<typeof modulesCoreConf>;
