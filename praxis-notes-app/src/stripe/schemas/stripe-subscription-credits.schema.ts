import { z } from 'zod';

/**
 * Schema for creating a new stripe subscription credits mapping
 */
export const createStripeSubscriptionCreditsSchema = z.object({
    stripePriceId: z.string().min(1),
    creditsAmount: z.number().int().positive(),
});

/**
 * Schema for updating an existing stripe subscription credits mapping
 */
export const updateStripeSubscriptionCreditsSchema = z.object({
    id: z.string().uuid(),
    stripePriceId: z.string().min(1),
    creditsAmount: z.number().int().positive(),
});

/**
 * Schema for retrieving stripe subscription credits mappings
 */
export const getStripeSubscriptionCreditsSchema = z.object({
    id: z.string().uuid(),
});

/**
 * Schema for listing stripe subscription credits mappings
 */
export const listStripeSubscriptionCreditsSchema = z.object({
    includeInactive: z.boolean().optional().default(false),
});
