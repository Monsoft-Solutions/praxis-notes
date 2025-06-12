import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { listStripeSubscriptionCreditsSchema } from '../schemas';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { eq } from 'drizzle-orm';

// Query to list all stripe subscription credit mappings (admin only)
export const listStripeSubscriptionCredits = protectedEndpoint
    .input(listStripeSubscriptionCreditsSchema)
    .query(
        queryMutationCallback(async ({ input: { includeInactive } }) => {
            // TODO: Add admin permission check here
            // ensurePermission({ user: ctx.session.user, resource: 'stripe_credits', action: 'read' });

            // Get all credit mappings, optionally including inactive ones
            const { data: mappings, error } = await catchError(
                db.query.stripeSubscriptionCreditsTable.findMany({
                    where: includeInactive
                        ? undefined
                        : (record) => eq(record.isActive, true),
                    orderBy: (record, { desc }) => [desc(record.createdAt)],
                }),
            );

            if (error) return Error();

            // Return the list of mappings
            return Success(mappings);
        }),
    );
