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

import { stripeProductTable } from './stripe-products.table';

// Define potential recurring intervals for prices
export const recurringIntervalEnum = enumType('recurring_interval', [
    'day',
    'week',
    'month',
    'year',
]);

// Define potential pricing types
export const priceTypeEnum = enumType('price_type', ['one_time', 'recurring']);

// Table to store Stripe Price information
export const stripePriceTable = table('stripe_price', {
    // Stripe Price ID
    id: varchar('id', { length: 255 }).primaryKey(),

    // Stripe Product ID (Foreign Key)
    productId: varchar('product_id', { length: 255 })
        .notNull()
        .references(() => stripeProductTable.id),

    // Whether the price is currently active in Stripe
    active: boolean('active').notNull().default(false),

    // Price currency (3-letter ISO code)
    currency: char('currency', { length: 3 }).notNull(),

    // Price description (optional)
    description: varchar('description', { length: 255 }),

    // Price type (one_time or recurring)
    type: sqlEnum('type', priceTypeEnum).notNull(),

    // Price amount (in smallest currency unit, e.g., cents)
    unitAmount: bigint('unit_amount', { mode: 'number' }).notNull(),

    // For recurring prices: Interval (day, week, month, year)
    recurringInterval: sqlEnum('recurring_interval', recurringIntervalEnum),

    // For recurring prices: Interval count
    recurringIntervalCount: bigint('recurring_interval_count', {
        mode: 'number',
    }),

    // For recurring prices: Trial period days (optional)
    trialPeriodDays: bigint('trial_period_days', { mode: 'number' }),
});

export const stripePriceRelations = relations(stripePriceTable, ({ one }) => ({
    // Relation to the product this price belongs to
    product: one(stripeProductTable, {
        fields: [stripePriceTable.productId],
        references: [stripeProductTable.id],
    }),
    // Potentially add relation to subscriptions later if needed
}));
