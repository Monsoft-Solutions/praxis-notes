import { Function } from '@errors/types';
import { Success } from '@errors/utils';

import { VerificationEmail } from '../../email';

import { addToAudienceResend, sendEmail } from '../../../email/utils';
import { logger } from '@logger/providers/logger.provider';

export const sendVerificationEmail = (async ({
    email,
    firstName,
    lastName = '',
    language = 'en',
    url,
}) => {
    const { error: resendError } = await addToAudienceResend({
        email,
        firstName,
        lastName,
    });

    if (resendError !== null) {
        logger.error('Failed to add user to Resend audience', {
            errorCode: resendError,
        });
    }

    // Email subject varies based on language
    const subject =
        language === 'es'
            ? `${firstName}, por favor verifica tu correo electrónico para comenzar a usar Praxis Notes`
            : `${firstName}, please verify your email to start using Praxis Notes`;

    // Email text varies based on language
    const text =
        language === 'es'
            ? `Por favor verifica tu correo electrónico haciendo clic en ${url}`
            : `Please verify your email by clicking ${url}`;

    await sendEmail({
        from: 'Praxis Notes <verify@praxisnotes.com>',
        to: email,
        subject,
        html: `<p>${text}</p>`,
        text,
        react: <VerificationEmail url={url} language={language} />,
    });

    return Success();
}) satisfies Function<{
    email: string;
    firstName: string;
    lastName?: string;
    language?: string;
    url: string;
}>;
