import { varchar } from '@db/sql';

export const sentryCoreConf = {
    sentryDsn: varchar('sentry_dsn', {
        length: 255,
    })
        .notNull()
        .default(''),
};
