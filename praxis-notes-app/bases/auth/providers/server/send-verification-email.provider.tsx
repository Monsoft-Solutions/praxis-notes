import { Function } from '@errors/types';
import { Success } from '@errors/utils';

import { appUrl } from '@dist/constants';

import { VerificationEmail } from '../../email';

import { addToAudienceResend, sendEmail } from '../../../email/utils';
import { logger } from '@logger/providers/logger.provider';

const verifyEmailPath = '/auth/verify-email';

export const sendVerificationEmail = (async ({ email, id, firstName }) => {
    const link = `${appUrl}${verifyEmailPath}?id=${id}`;

    const { error: resendError } = await addToAudienceResend({
        email,
        firstName,
        lastName: '',
    });

    if (resendError !== null) {
        logger.error('Failed to add user to Resend audience', {
            errorCode: resendError,
        });
    }

    await sendEmail({
        from: 'Praxis Notes <verify@praxisnotes.com>',
        to: email,

        subject: `${firstName}, please verify your email to start using Praxis Notes`,

        html: `<p>Please verify your email by clicking <a href="${link}">here</a></p>`,

        text: `Please verify your email by clicking ${link}`,

        react: <VerificationEmail url={link} />,
    });

    return Success();
}) satisfies Function<{ email: string; id: string; firstName: string }>;
