import { relations } from 'drizzle-orm';

import { char, int, table, text, bigint, enumType, sqlEnum } from '@db/sql';

import { user } from '@auth/db';

import { transactionTypeEnum } from '../enums';

// Transaction type as an SQL enum
export const transactionTypeEnumSql = enumType(
    'transaction_type',
    transactionTypeEnum.options,
);

/**
 * User credit transactions table
 * Tracks all credit additions and consumption for audit trail
 */
export const userCreditTransactionsTable = table('user_credit_transactions', {
    id: char('id', { length: 36 }).primaryKey(),

    // Reference to the user
    userId: char('user_id', { length: 36 })
        .notNull()
        .references(() => user.id),

    // Type of transaction: 'subscription', 'purchase', 'consume', 'refund', 'manual_adjustment', 'subscription_renewal'
    transactionType: sqlEnum(
        'transaction_type',
        transactionTypeEnumSql,
    ).notNull(),

    // Amount of credits (positive for additions, negative for consumption)
    amount: int('amount').notNull(),

    // User's credit balance after this transaction
    balanceAfter: int('balance_after').notNull(),

    // Description of the transaction
    description: text('description'),

    // Additional metadata (JSON stored as text)
    metadata: text('metadata'),

    // When the transaction occurred
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

export const userCreditTransactionsTableRelations = relations(
    userCreditTransactionsTable,
    ({ one }) => ({
        // User who owns this transaction
        user: one(user, {
            fields: [userCreditTransactionsTable.userId],
            references: [user.id],
        }),
    }),
);
