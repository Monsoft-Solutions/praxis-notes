import * as appCustom from '@app/conf/custom';

// full app custom configuration
export const appCustomConf = Object.entries(appCustom).reduce(
    (acc, [, moduleConf]) => ({
        ...acc,
        ...moduleConf,
    }),
    {},
) as {
    [K in keyof (typeof appCustom)[keyof typeof appCustom]]: (typeof appCustom)[keyof typeof appCustom][K];
};
