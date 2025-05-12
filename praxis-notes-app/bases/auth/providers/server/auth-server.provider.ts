import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization } from 'better-auth/plugins';

import { db } from '@db/providers/server';

import { authPath } from '@auth/constants';

import { authEnv } from '@env/constants/auth-env.constant';

import { userAdditionalFields } from '@auth/constants';

import bcrypt from 'bcryptjs';

import { sendVerificationEmail as sendVerificationEmailUtil } from './send-verification-email.provider';

export const authServer = betterAuth({
    basePath: authPath,

    secret: authEnv.MSS_AUTH_SECRET,

    database: drizzleAdapter(db, {
        provider: 'pg',
    }),

    plugins: [organization()],

    emailAndPassword: {
        enabled: true,

        password: {
            hash(password) {
                return bcrypt.hash(password, 10);
            },

            verify({ password, hash }) {
                return bcrypt.compare(password, hash);
            },
        },

        requireEmailVerification: true,
    },

    user: {
        additionalFields: userAdditionalFields,
    },

    emailVerification: {
        sendOnSignUp: true,

        autoSignInAfterVerification: true,

        async sendVerificationEmail({ user: { name, email }, url }) {
            await sendVerificationEmailUtil({
                email,
                firstName: name,
                url,
            });
        },

        async onEmailVerification(user) {
            await authServer.api.createOrganization({
                body: {
                    name: `${user.name}'s Organization`,
                    slug: `${user.name.replace(' ', '-').toLowerCase()}-org`,
                    userId: user.id,
                },
            });
        },
    },
});

export { authServer as auth };
