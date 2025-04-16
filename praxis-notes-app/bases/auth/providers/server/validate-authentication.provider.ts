import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { eq } from 'drizzle-orm';

import bcrypt from 'bcryptjs';

import { db } from '@db/providers/server';
import { catchError } from '@errors/utils/catch-error.util';

const invalidCredentialsError = 'INVALID_CREDENTIALS';

// Validate user credentials
// Check email exists and password matches
export const validateAuthentication = (async ({ email, password }) => {
    // Fetch the user based on email
    const { data: authentication, error } = await catchError(
        db.query.authenticationTable.findFirst({
            where: (entity) => eq(entity.email, email),
        }),
    );

    // if some error occurred while fetching the user
    if (error) return Error();
    // otherwise...

    // if user does not exist
    if (authentication === undefined) return Error(invalidCredentialsError);

    // compare password with the hash stored on DB
    const isPasswordValid = await bcrypt.compare(
        password,
        authentication.password,
    );

    // if password is incorrect
    if (!isPasswordValid) return Error(invalidCredentialsError);
    // otherwise...

    const { userId } = authentication;

    // return the id of the authenticated user
    return Success({ userId });
}) satisfies Function<{ email: string; password: string }, { userId: string }>;
