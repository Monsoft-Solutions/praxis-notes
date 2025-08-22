import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { eq } from 'drizzle-orm';

import { stripeSubscriptionCreditsTable } from '../db';
import { updateStripeSubscriptionCreditsSchema } from '../schemas';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

// Mutation to update an existing stripe subscription credit mapping (admin only)
export const updateStripeSubscriptionCredits = protectedEndpoint
    .input(updateStripeSubscriptionCreditsSchema)
    .mutation(
        queryMutationCallback(async ({ input }) => {
            // TODO: Add admin permission check here
            // ensurePermission({ user: ctx.session.user, resource: 'stripe_credits', action: 'update' });

            const { id, ...updates } = input;

            // Update the credit mapping
            const { error } = await catchError(
                db
                    .update(stripeSubscriptionCreditsTable)
                    .set({
                        stripePriceId: updates.stripePriceId,
                        creditsAmount: updates.creditsAmount,
                    })
                    .where(eq(stripeSubscriptionCreditsTable.id, id)),
            );

            if (error) return Error();

            // Return success
            return Success();
        }),
    );
