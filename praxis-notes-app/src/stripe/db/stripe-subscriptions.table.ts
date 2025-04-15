import { relations } from 'drizzle-orm';

import {
    bigint,
    boolean,
    char,
    enumType,
    sqlEnum,
    table,
    varchar,
} from '@db/sql';

import { stripePriceTable } from './stripe-prices.table';
import { userTable } from '@db/db.tables';

// Define potential subscription statuses based on Stripe
export const subscriptionStatusEnum = enumType('subscription_status', [
    'trialing',
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'unpaid',
    'paused',
]);

// Table to store Stripe Subscription information
export const stripeSubscriptionTable = table('stripe_subscription', {
    // Stripe Subscription ID
    id: varchar('id', { length: 255 }).primaryKey(),

    // Application user ID (Foreign Key)
    userId: char('user_id', { length: 36 })
        .notNull()
        .references(() => userTable.id),

    // Stripe Price ID (Foreign Key)
    priceId: varchar('price_id', { length: 255 })
        .notNull()
        .references(() => stripePriceTable.id),

    // Current status of the subscription
    status: sqlEnum('status', subscriptionStatusEnum).notNull(),

    // The end date of the current billing period (Unix timestamp)
    currentPeriodEnd: bigint('current_period_end', {
        mode: 'number',
    }).notNull(),

    // The start date of the current billing period (Unix timestamp)
    currentPeriodStart: bigint('current_period_start', {
        mode: 'number',
    }).notNull(),

    // Date the subscription was canceled (Unix timestamp, optional)
    canceledAt: bigint('canceled_at', { mode: 'number' }),

    // If the subscription was canceled, the date when the cancellation takes effect (Unix timestamp, optional)
    cancelAt: bigint('cancel_at', { mode: 'number' }),

    // If the subscription was canceled, indicates if it will cancel at the period end (optional)
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),

    // Date the subscription trial started (Unix timestamp, optional)
    trialStart: bigint('trial_start', { mode: 'number' }),

    // Date the subscription trial ends (Unix timestamp, optional)
    trialEnd: bigint('trial_end', { mode: 'number' }),
});

export const stripeSubscriptionRelations = relations(
    stripeSubscriptionTable,
    ({ one }) => ({
        // Relation to the user this subscription belongs to
        user: one(userTable, {
            fields: [stripeSubscriptionTable.userId],
            references: [userTable.id],
        }),
        // Relation to the price associated with this subscription
        price: one(stripePriceTable, {
            fields: [stripeSubscriptionTable.priceId],
            references: [stripePriceTable.id],
        }),
    }),
);
