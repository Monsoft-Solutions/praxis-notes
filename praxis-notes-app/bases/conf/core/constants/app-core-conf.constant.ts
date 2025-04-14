import * as appCore from '@app/conf/core';

// full app core configuration
export const appCoreConf = Object.entries(appCore).reduce(
    (acc, [, moduleConf]) => ({
        ...acc,
        ...moduleConf,
    }),
    {},
) as {
    [K in keyof (typeof appCore)[keyof typeof appCore]]: (typeof appCore)[keyof typeof appCore][K];
};
