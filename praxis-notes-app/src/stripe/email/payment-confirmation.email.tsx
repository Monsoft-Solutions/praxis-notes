import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

const THEME = {
    colors: {
        brand: '#2250f4',
        offwhite: '#fafbfb',
        text: '#1b1b1f',
    },
    spacing: {
        0: '0px',
        16: '16px',
        24: '24px',
        40: '40px',
    },
};

const translations = {
    en: {
        preview: 'Payment Confirmation for Praxis Notes',
        title: 'Payment Confirmation',
        message:
            'Thank you for your payment! Your transaction has been successfully processed.',
        detailsTitle: 'Payment Details',
        amountLabel: 'Amount:',
        dateLabel: 'Date:',
        invoiceLabel: 'Invoice ID:',
        viewInvoiceText: 'View Invoice',
        footerMessage:
            'Thank you for using Praxis Notes. If you have any questions about this payment, please contact our support team.',
    },
    es: {
        preview: 'Confirmación de Pago para Praxis Notes',
        title: 'Confirmación de Pago',
        message:
            '¡Gracias por su pago! Su transacción ha sido procesada con éxito.',
        detailsTitle: 'Detalles del Pago',
        amountLabel: 'Monto:',
        dateLabel: 'Fecha:',
        invoiceLabel: 'ID de Factura:',
        viewInvoiceText: 'Ver Factura',
        footerMessage:
            'Gracias por usar Praxis Notes. Si tiene alguna pregunta sobre este pago, comuníquese con nuestro equipo de soporte.',
    },
};

export const PaymentConfirmationEmail = ({
    amount,
    date,
    invoiceId,
    invoiceUrl,
    language = 'en',
}: {
    amount: string;
    date: string;
    invoiceId: string;
    invoiceUrl: string;
    language?: string;
}) => {
    const lang = language === 'es' ? 'es' : 'en';
    const t = translations[lang];

    return (
        <Html lang={lang}>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: THEME.colors,
                            spacing: THEME.spacing,
                        },
                    },
                }}
            >
                <Head />

                <Preview>{t.preview}</Preview>

                <Body className="bg-offwhite text-text font-sans text-base leading-relaxed">
                    {/* Accent bar */}
                    <Section className="bg-brand h-1" role="presentation" />

                    <Container className="mx-auto max-w-[600px] rounded-lg bg-white p-24 shadow-sm">
                        {/* Header */}
                        <Heading
                            as="h1"
                            className="mb-16 mt-0 text-center text-2xl font-semibold"
                        >
                            {t.title}
                        </Heading>

                        <Text className="mb-24">{t.message}</Text>

                        {/* Payment Details */}
                        <Section className="mb-24">
                            <Heading
                                as="h2"
                                className="mb-16 text-xl font-semibold"
                            >
                                {t.detailsTitle}
                            </Heading>

                            <Text className="my-8">
                                <strong>{t.amountLabel}</strong> {amount}
                            </Text>
                            <Text className="my-8">
                                <strong>{t.dateLabel}</strong> {date}
                            </Text>
                            <Text className="my-8">
                                <strong>{t.invoiceLabel}</strong> {invoiceId}
                            </Text>
                        </Section>

                        <Section className="mb-24 text-center">
                            <Button
                                href={invoiceUrl}
                                rel="noopener noreferrer"
                                className="bg-brand rounded-lg px-6 py-3 font-medium text-white"
                            >
                                {t.viewInvoiceText}
                            </Button>
                        </Section>

                        <Hr className="my-24 border-t border-gray-200" />

                        {/* ———Footer——— */}
                        <Section className="text-center">
                            {/* Contact */}
                            <Text className="mb-16 text-sm">
                                <a
                                    href="https://www.praxisnotes.com"
                                    className="text-brand underline"
                                    rel="noopener noreferrer"
                                >
                                    www.praxisnotes.com
                                </a>
                                &nbsp;|&nbsp;
                                <a
                                    href="mailto:support@praxisnotes.com"
                                    className="text-brand underline"
                                >
                                    support@praxisnotes.com
                                </a>
                            </Text>
                        </Section>

                        <Text className="mt-24 text-center text-xs text-gray-500">
                            {t.footerMessage}
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
