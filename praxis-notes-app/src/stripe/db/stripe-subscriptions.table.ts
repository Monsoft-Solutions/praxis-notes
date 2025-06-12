import { relations } from 'drizzle-orm';

import {
    boolean,
    char,
    table,
    varchar,
    bigint,
    enumType,
    sqlEnum,
} from '@db/sql';

import { user } from '@auth/db';

import { stripeSubscriptionStatusEnum } from '../enums';

// Stripe subscription status as an SQL enum
export const stripeSubscriptionStatusEnumSql = enumType(
    'stripe_subscription_status',
    stripeSubscriptionStatusEnum.options,
);

/**
 * Stripe subscriptions table
 * Tracks user subscriptions and their status
 */
export const stripeSubscriptionsTable = table('stripe_subscriptions', {
    id: char('id', { length: 36 }).primaryKey(),

    // Reference to the user who owns this subscription
    userId: char('user_id', { length: 36 })
        .notNull()
        .references(() => user.id),

    // Stripe subscription ID
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 })
        .notNull()
        .unique(),

    // Stripe customer ID associated with this subscription
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).notNull(),

    // Stripe price ID for this subscription
    stripePriceId: varchar('stripe_price_id', { length: 255 }).notNull(),

    // Current status of the subscription
    status: sqlEnum('status', stripeSubscriptionStatusEnumSql).notNull(),

    // Start of the current billing period (Unix timestamp)
    currentPeriodStart: bigint('current_period_start', { mode: 'number' }),

    // End of the current billing period (Unix timestamp)
    currentPeriodEnd: bigint('current_period_end', { mode: 'number' }),

    // Whether the subscription will be canceled at the end of the current period
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),

    // When the subscription was created
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),

    // When the subscription was last updated
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
});

export const stripeSubscriptionsTableRelations = relations(
    stripeSubscriptionsTable,
    ({ one }) => ({
        // User who owns this subscription
        user: one(user, {
            fields: [stripeSubscriptionsTable.userId],
            references: [user.id],
        }),
    }),
);
