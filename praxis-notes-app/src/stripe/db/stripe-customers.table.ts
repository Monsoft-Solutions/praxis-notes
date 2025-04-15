import { relations } from 'drizzle-orm';

import { char, table, varchar } from '@db/sql';
import { userTable } from '@db/db.tables';

// Table to map application users to Stripe Customer IDs
export const stripeCustomerTable = table('stripe_customer', {
    // Application user ID (Foreign Key)
    userId: char('user_id', { length: 36 })
        .primaryKey()
        .references(() => userTable.id, {
            onDelete: 'cascade', // Optional: Delete Stripe customer if user is deleted
        }),

    // Stripe Customer ID
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 })
        .unique()
        .notNull(),
});

export const stripeCustomerRelations = relations(
    stripeCustomerTable,
    ({ one }) => ({
        // Relation to the user table
        user: one(userTable, {
            fields: [stripeCustomerTable.userId],
            references: [userTable.id],
        }),
    }),
);
