import { char, table } from '@db/sql';

import { appUserCredits } from '../constants';

import { user } from '@auth/db';

export const userCreditsTable = table('user_credits', {
    id: char('id', { length: 36 }).primaryKey(),

    userId: char('user_id', { length: 36 })
        .notNull()
        .references(() => user.id),

    ...appUserCredits,
});
