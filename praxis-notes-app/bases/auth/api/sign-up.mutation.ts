import { publicEndpoint } from '@api/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';

import { signUpFormSchema } from '@auth/schemas';
import { userTable, organizationTable, unverifiedEmailTable } from '@auth/db';

import { v4 as uuidv4 } from 'uuid';

import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@auth/providers/server';

// sign up a user
// Input: name, email, password
export const signUp = publicEndpoint.input(signUpFormSchema).mutation(
    queryMutationCallback(async ({ input: { name, email, password } }) => {
        const unverifiedEmailId = uuidv4();

        const { error } = await catchError(
            db.transaction(async (tx) => {
                const organizationId = uuidv4();

                await tx.insert(organizationTable).values({
                    id: organizationId,
                    name: `${name}'s Org`,
                });

                const userId = uuidv4();

                await tx.insert(userTable).values({
                    id: userId,
                    organizationId,

                    firstName: name,
                });

                const hashedPassword = await bcrypt.hash(password, 10);

                await tx.insert(unverifiedEmailTable).values({
                    id: unverifiedEmailId,
                    userId,

                    email,
                    password: hashedPassword,
                });
            }),
        );

        if (error) return Error();

        sendVerificationEmail({
            id: unverifiedEmailId,
        });

        return Success();
    }),
);
