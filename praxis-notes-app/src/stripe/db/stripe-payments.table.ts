import { relations } from 'drizzle-orm';

import { bigint, char, enumType, sqlEnum, table, varchar } from '@db/sql';

import { userTable } from '@db/db.tables';
import { stripeSubscriptionTable } from './stripe-subscriptions.table';

// Define potential payment intent statuses based on Stripe
export const paymentStatusEnum = enumType('payment_status', [
    'requires_payment_method',
    'requires_confirmation',
    'requires_action',
    'processing',
    'requires_capture',
    'canceled',
    'succeeded',
]);

// Table to log Stripe Payment Intent information
export const stripePaymentTable = table('stripe_payment', {
    // Stripe Payment Intent ID or Charge ID
    id: varchar('id', { length: 255 }).primaryKey(),

    // Application user ID (Foreign Key)
    userId: char('user_id', { length: 36 })
        .notNull()
        .references(() => userTable.id),

    // Optional: Stripe Subscription ID if the payment is related to a subscription
    subscriptionId: varchar('subscription_id', { length: 255 }).references(
        () => stripeSubscriptionTable.id,
    ),

    // Payment amount (in smallest currency unit, e.g., cents)
    amount: bigint('amount', { mode: 'number' }).notNull(),

    // Payment currency (3-letter ISO code)
    currency: char('currency', { length: 3 }).notNull(),

    // Current status of the payment intent
    status: sqlEnum('status', paymentStatusEnum).notNull(),

    // Timestamp of payment creation (Unix timestamp)
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

export const stripePaymentRelations = relations(
    stripePaymentTable,
    ({ one }) => ({
        // Relation to the user who made the payment
        user: one(userTable, {
            fields: [stripePaymentTable.userId],
            references: [userTable.id],
        }),
        // Optional: Relation to the subscription associated with the payment
        subscription: one(stripeSubscriptionTable, {
            fields: [stripePaymentTable.subscriptionId],
            references: [stripeSubscriptionTable.id],
        }),
    }),
);
