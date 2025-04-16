import { Function } from '@errors/types';
import { Success } from '@errors/utils';

import { appUrl } from '@dist/constants';

import { VerificationEmail } from '../../email';

import { sendEmail } from '../../../email/utils';

const verifyEmailPath = '/auth/verify-email';

export const sendVerificationEmail = (async ({ email, id }) => {
    const link = `${appUrl}${verifyEmailPath}?id=${id}`;

    await sendEmail({
        from: 'Acme <onboarding@resend.dev>',
        to: email,

        subject: 'Verify your email',

        html: `<p>Please verify your email by clicking <a href="${link}">here</a></p>`,

        text: `Please verify your email by clicking ${link}`,

        react: <VerificationEmail url={link} />,
    });

    return Success();
}) satisfies Function<{ email: string; id: string }>;
