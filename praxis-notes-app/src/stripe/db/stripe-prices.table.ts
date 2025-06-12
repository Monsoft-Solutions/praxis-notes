import { relations } from 'drizzle-orm';

import { boolean, int, table, text, varchar, bigint } from '@db/sql';

/**
 * Stripe prices table
 * Stores price information from Stripe
 */
export const stripePricesTable = table('stripe_prices', {
    id: varchar('id', { length: 36 }).primaryKey(),

    // Stripe price ID
    stripePriceId: varchar('stripe_price_id', { length: 255 })
        .notNull()
        .unique(),

    // Associated Stripe product ID
    stripeProductId: varchar('stripe_product_id', { length: 255 }).notNull(),

    // Price amount in cents
    amount: bigint('amount', { mode: 'number' }).notNull(),

    // Currency (e.g., 'usd', 'eur')
    currency: varchar('currency', { length: 10 }).notNull(),

    // Billing interval (e.g., 'month', 'year')
    interval: varchar('interval', { length: 20 }),

    // Number of intervals between billings
    intervalCount: int('interval_count'),

    // Whether this price is active
    active: boolean('active').default(true).notNull(),

    // Price metadata from Stripe (JSON stored as text)
    metadata: text('metadata'),

    // When the price was created
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),

    // When the price was last updated
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
});

export const stripePricesTableRelations = relations(
    stripePricesTable,
    () => ({}),
);
