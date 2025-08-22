import { z } from 'zod';

export const transactionTypeEnum = z.enum([
    'subscription',
    'purchase',
    'consume',
    'refund',
    'manual_adjustment',
    'subscription_renewal',
]);

export type TransactionType = z.infer<typeof transactionTypeEnum>;
