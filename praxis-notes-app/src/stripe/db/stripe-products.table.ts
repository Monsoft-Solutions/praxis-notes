import { relations } from 'drizzle-orm';

import { boolean, table, text, varchar, bigint } from '@db/sql';

/**
 * Stripe products table
 * Stores product information from Stripe
 */
export const stripeProductsTable = table('stripe_products', {
    id: varchar('id', { length: 36 }).primaryKey(),

    // Stripe product ID
    stripeProductId: varchar('stripe_product_id', { length: 255 })
        .notNull()
        .unique(),

    // Product name
    name: varchar('name', { length: 255 }).notNull(),

    // Product description
    description: text('description'),

    // Whether this product is active
    active: boolean('active').default(true).notNull(),

    // Product metadata from Stripe (JSON stored as text)
    metadata: text('metadata'),

    // When the product was created
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),

    // When the product was last updated
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
});

export const stripeProductsTableRelations = relations(
    stripeProductsTable,
    () => ({}),
);
