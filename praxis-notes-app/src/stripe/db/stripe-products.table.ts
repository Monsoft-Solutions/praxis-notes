import { relations } from 'drizzle-orm';

import { bigint, boolean, table, text, varchar } from '@db/sql';
import { stripePriceTable } from './stripe-prices.table';

// Table to store Stripe Product information relevant to the application
export const stripeProductTable = table('stripe_product', {
    // Stripe Product ID
    id: varchar('id', { length: 255 }).primaryKey(),

    // Whether the product is currently active in Stripe
    active: boolean('active').notNull().default(false),

    // Product name
    name: varchar('name', { length: 255 }).notNull(),

    // Product description
    description: text('description'),

    // Timestamp of creation in Stripe (Unix timestamp)
    createdAt: bigint('created_at', { mode: 'number' }),

    // Timestamp of last update in Stripe (Unix timestamp)
    updatedAt: bigint('updated_at', { mode: 'number' }),
});

export const stripeProductRelations = relations(
    stripeProductTable,
    ({ many }) => ({
        // Relation to prices associated with this product
        prices: many(stripePriceTable),
    }),
);
