import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization } from 'better-auth/plugins';

import { db } from '@db/providers/server';

import { authPath } from '@auth/constants';

import { authEnv } from '@env/constants/auth-env.constant';

import { userAdditionalFields } from '@auth/constants';

import bcrypt from 'bcryptjs';

import { sendVerificationEmail as sendVerificationEmailUtil } from './send-verification-email.provider';

import { GoogleProfile } from '@auth/types';

// Import email utilities
import { addToAudienceResend } from '@email/utils/resend-add-to-audience.util';
import { addSubscriberToWelcomeCampaign } from '@email/utils/mailer-lite.util';

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

    socialProviders: {
        google: {
            clientId: authEnv.MSS_GOOGLE_ID,
            clientSecret: authEnv.MSS_GOOGLE_SECRET,

            mapProfileToUser: ({
                email,
                given_name,
                family_name,
            }: GoogleProfile) => {
                return {
                    email,
                    name: given_name,
                    lastName: family_name,
                };
            },
        },
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
    },

    // Database hooks to add users to email marketing platforms
    databaseHooks: {
        user: {
            create: {
                async after(user): Promise<void> {
                    try {
                        // Add user to Resend audience
                        const resendResult = await addToAudienceResend({
                            email: user.email,
                            firstName: user.name || 'User',
                            lastName: '', // User object doesn't have lastName in base schema, but may have it from additionalFields
                        });

                        if (resendResult.error !== null) {
                            console.error(
                                'Failed to add user to Resend audience:',
                                {
                                    userId: user.id,
                                    email: user.email,
                                    error: resendResult.error,
                                },
                            );
                        } else {
                            console.log(
                                'Successfully added user to Resend audience:',
                                user.email,
                            );
                        }

                        // Add user to MailerLite welcome campaign
                        const mailerLiteResult =
                            await addSubscriberToWelcomeCampaign({
                                email: user.email,
                                name: user.name || 'User',
                                language: 'en', // You can modify this based on user preference if available
                            });

                        if (mailerLiteResult.error !== null) {
                            console.error('Failed to add user to MailerLite:', {
                                userId: user.id,
                                email: user.email,
                                error: mailerLiteResult.error,
                            });
                        } else {
                            console.log(
                                'Successfully added user to MailerLite campaign:',
                                user.email,
                            );
                        }
                    } catch (error) {
                        console.error('Error in user creation hook:', {
                            userId: user.id,
                            email: user.email,
                            error,
                        });
                    }
                },
            },
        },
    },
});

export { authServer as auth };
