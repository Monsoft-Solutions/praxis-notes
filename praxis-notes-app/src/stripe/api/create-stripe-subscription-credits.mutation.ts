import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { v4 as uuidv4 } from 'uuid';

import { stripeSubscriptionCreditsTable } from '../db';
import { createStripeSubscriptionCreditsSchema } from '../schemas';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

// Mutation to create a new stripe subscription credit mapping (admin only)
export const createStripeSubscriptionCredits = protectedEndpoint
    .input(createStripeSubscriptionCreditsSchema)
    .mutation(
        queryMutationCallback(async ({ input }) => {
            // TODO: Add admin permission check here
            // ensurePermission({ user: ctx.session.user, resource: 'stripe_credits', action: 'create' });

            const id = uuidv4();

            // Create the new credit mapping
            const { error } = await catchError(
                db.insert(stripeSubscriptionCreditsTable).values({
                    id,
                    stripePriceId: input.stripePriceId,
                    creditsAmount: input.creditsAmount,
                    createdAt: Date.now(),
                    isActive: true,
                }),
            );

            if (error) {
                if (error === 'DUPLICATE_ENTRY') return Error('DUPLICATE');
                return Error();
            }

            // Return success with the created mapping
            const { data: newMapping } = await catchError(
                db.query.stripeSubscriptionCreditsTable.findFirst({
                    where: (record, { eq }) => eq(record.id, id),
                }),
            );

            return Success(newMapping);
        }),
    );
