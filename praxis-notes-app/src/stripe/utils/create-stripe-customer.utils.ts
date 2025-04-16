import { authenticationTable, userTable } from '@db/db.tables';
import { db } from '@db/providers/server';
import { eq } from 'drizzle-orm';
import { catchError } from '@errors/utils/catch-error.util';
import { stripe } from '@src/stripe/config/stripe';
import { TRPCError } from '@trpc/server';

/**
 * Creates a Stripe customer for a user.
 * @param userId - The ID of the user to create a Stripe customer for.
 * @returns The Stripe customer object.
 */
export const createStripeCustomer = async (userId: string) => {
    const user = await getUserData(userId);

    const { data: customer, error: customerCreateError } = await catchError(
        stripe.customers.create({
            email: user.email,
            name: `${user.firstName} ${user.lastName ?? ''}`.trim(),
            metadata: { userId },
        }),
    );

    if (customerCreateError) {
        console.error('Stripe Error creating customer:', customerCreateError);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create Stripe customer.',
        });
    }

    return customer;
};

/**
 * Fetches user data from the database.
 * @param userId - The ID of the user to fetch data for.
 * @returns The user data.
 */
const getUserData = async (userId: string) => {
    const { data: user, error: userFetchError } = await catchError(
        db
            .select({
                id: userTable.id,
                email: authenticationTable.email,
                firstName: userTable.firstName,
                lastName: userTable.lastName,
            })
            .from(userTable)
            .where(eq(userTable.id, userId))
            .innerJoin(
                authenticationTable,
                eq(userTable.id, authenticationTable.userId),
            ),
    );
    if (userFetchError) {
        console.error('DB Error fetching user:', userFetchError);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch user data.',
        });
    }

    if (user.length === 0) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found.',
        });
    }

    return user[0];
};
