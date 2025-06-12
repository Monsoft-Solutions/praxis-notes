import { z } from 'zod';

export const paymentStatusEnum = z.enum([
    'succeeded',
    'pending',
    'failed',
    'canceled',
    'processing',
    'requires_payment_method',
    'requires_confirmation',
    'requires_action',
]);

export type PaymentStatus = z.infer<typeof paymentStatusEnum>;
