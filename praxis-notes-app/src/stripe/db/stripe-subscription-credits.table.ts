import { relations } from 'drizzle-orm';
import { boolean, bigint, table, varchar } from '@db/sql';

/**
 * Stripe subscription credits mapping table
 */
export const stripeSubscriptionCreditsTable = table(
    'stripe_subscription_credits',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        stripePriceId: varchar('stripe_price_id', { length: 255 }).notNull(),
        creditsAmount: bigint('credits_amount', { mode: 'number' }).notNull(),
        createdAt: bigint('created_at', { mode: 'number' }).notNull(),
        isActive: boolean('is_active').default(true).notNull(),
    },
);

export const stripeSubscriptionCreditsTableRelations = relations(
    stripeSubscriptionCreditsTable,
    () => ({}),
);
