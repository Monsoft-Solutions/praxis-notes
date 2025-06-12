import { relations } from 'drizzle-orm';

import { char, table, text, varchar, bigint, enumType, sqlEnum } from '@db/sql';

import { user } from '@auth/db';

import { paymentStatusEnum } from '../enums';

// Payment status as an SQL enum
export const paymentStatusEnumSql = enumType(
    'payment_status',
    paymentStatusEnum.options,
);

/**
 * Stripe payments table
 * Logs payment intents and charges from Stripe
 */
export const stripePaymentsTable = table('stripe_payments', {
    id: char('id', { length: 36 }).primaryKey(),

    // Reference to the user who made this payment
    userId: char('user_id', { length: 36 })
        .notNull()
        .references(() => user.id),

    // Stripe payment intent ID (optional, for payment intents)
    stripePaymentIntentId: varchar('stripe_payment_intent_id', {
        length: 255,
    }).unique(),

    // Stripe invoice ID (optional, for subscription payments)
    stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }),

    // Payment amount in cents
    amount: bigint('amount', { mode: 'number' }).notNull(),

    // Currency (e.g., 'usd', 'eur')
    currency: varchar('currency', { length: 10 }).notNull(),

    // Payment status
    status: sqlEnum('status', paymentStatusEnumSql).notNull(),

    // Payment description
    description: text('description'),

    // When the payment was created
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

export const stripePaymentsTableRelations = relations(
    stripePaymentsTable,
    ({ one }) => ({
        // User who made this payment
        user: one(user, {
            fields: [stripePaymentsTable.userId],
            references: [user.id],
        }),
    }),
);
