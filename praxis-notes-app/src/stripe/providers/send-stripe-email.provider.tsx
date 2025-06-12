import { Function } from '@errors/types';
import { Success } from '@errors/utils';

import { PaymentConfirmationEmail, SubscriptionStatusEmail } from '../email';
import { addToAudienceResend, sendEmail } from '../../../bases/email/utils';
import { logger } from '@logger/providers/logger.provider';

type StatusType = 'created' | 'updated' | 'canceled';

// Send payment confirmation email
export const sendPaymentConfirmationEmail = (async ({
    email,
    firstName,
    lastName = '',
    language = 'en',
    amount,
    date,
    invoiceId,
    invoiceUrl,
}) => {
    const { error: resendError } = await addToAudienceResend({
        email,
        firstName,
        lastName,
    });

    if (resendError !== null) {
        logger.error(
            'Failed to add user to Resend audience for payment confirmation',
            {
                errorCode: resendError,
            },
        );
    }

    // Email subject varies based on language
    const subject =
        language === 'es'
            ? `${firstName}, confirmación de pago para Praxis Notes`
            : `${firstName}, payment confirmation for Praxis Notes`;

    // Email text varies based on language
    const text =
        language === 'es'
            ? `Gracias por tu pago de ${amount}. Tu factura está disponible en ${invoiceUrl}`
            : `Thank you for your payment of ${amount}. Your invoice is available at ${invoiceUrl}`;

    await sendEmail({
        from: 'Praxis Notes <billing@praxisnotes.com>',
        to: email,
        subject,
        html: `<p>${text}</p>`,
        text,
        react: (
            <PaymentConfirmationEmail
                amount={amount}
                date={date}
                invoiceId={invoiceId}
                invoiceUrl={invoiceUrl}
                language={language}
            />
        ),
    });

    return Success();
}) satisfies Function<{
    email: string;
    firstName: string;
    lastName?: string;
    language?: string;
    amount: string;
    date: string;
    invoiceId: string;
    invoiceUrl: string;
}>;

// Send subscription status email
export const sendSubscriptionStatusEmail = (async ({
    email,
    firstName,
    language = 'en',
    status,
    planName,
    price,
    startDate,
    endDate,
    nextRenewal,
    cancelDate,
    managementUrl,
}) => {
    let subject, text;

    // Email subject varies based on language and status
    if (language === 'es') {
        if (status === 'created') {
            subject = `${firstName}, tu suscripción a Praxis Notes ha sido activada`;
            text = `Tu suscripción al plan ${planName} ha sido activada con éxito. Puedes administrar tu suscripción en ${managementUrl}`;
        } else if (status === 'updated') {
            subject = `${firstName}, tu suscripción a Praxis Notes ha sido actualizada`;
            text = `Tu suscripción a Praxis Notes ha sido actualizada. Puedes revisar los detalles en ${managementUrl}`;
        } else {
            subject = `${firstName}, tu suscripción a Praxis Notes ha sido cancelada`;
            text = `Tu suscripción a Praxis Notes ha sido cancelada. Esperamos verte pronto de nuevo.`;
        }
    } else {
        if (status === 'created') {
            subject = `${firstName}, your Praxis Notes subscription has been activated`;
            text = `Your subscription to the ${planName} plan has been successfully activated. You can manage your subscription at ${managementUrl}`;
        } else if (status === 'updated') {
            subject = `${firstName}, your Praxis Notes subscription has been updated`;
            text = `Your Praxis Notes subscription has been updated. You can review the details at ${managementUrl}`;
        } else {
            subject = `${firstName}, your Praxis Notes subscription has been canceled`;
            text = `Your Praxis Notes subscription has been canceled. We hope to see you again soon.`;
        }
    }

    await sendEmail({
        from: 'Praxis Notes <billing@praxisnotes.com>',
        to: email,
        subject,
        html: `<p>${text}</p>`,
        text,
        react: (
            <SubscriptionStatusEmail
                status={status}
                planName={planName}
                price={price}
                startDate={startDate}
                endDate={endDate}
                nextRenewal={nextRenewal}
                cancelDate={cancelDate}
                managementUrl={managementUrl}
                language={language}
            />
        ),
    });

    return Success();
}) satisfies Function<{
    email: string;
    firstName: string;
    lastName?: string;
    language?: string;
    status: StatusType;
    planName: string;
    price: string;
    startDate: string;
    endDate?: string;
    nextRenewal?: string;
    cancelDate?: string;
    managementUrl: string;
}>;
