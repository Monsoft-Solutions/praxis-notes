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
        success: '#34c759',
        warning: '#ff9500',
        danger: '#ff3b30',
    },
    spacing: {
        0: '0px',
        16: '16px',
        24: '24px',
        40: '40px',
    },
};

type StatusType = 'created' | 'updated' | 'canceled';

const getStatusColor = (status: StatusType): string => {
    switch (status) {
        case 'created':
            return THEME.colors.success;
        case 'updated':
            return THEME.colors.warning;
        case 'canceled':
            return THEME.colors.danger;
        default:
            return THEME.colors.brand;
    }
};

const translations = {
    en: {
        preview: {
            created: 'Your Praxis Notes subscription has been activated',
            updated: 'Your Praxis Notes subscription has been updated',
            canceled: 'Your Praxis Notes subscription has been canceled',
        },
        title: {
            created: 'Subscription Activated',
            updated: 'Subscription Updated',
            canceled: 'Subscription Canceled',
        },
        message: {
            created:
                'Thank you for subscribing to Praxis Notes! Your subscription has been successfully activated.',
            updated:
                'Your Praxis Notes subscription has been updated. Please review the details below.',
            canceled:
                "Your Praxis Notes subscription has been canceled. We're sorry to see you go.",
        },
        detailsTitle: 'Subscription Details',
        planLabel: 'Plan:',
        priceLabel: 'Price:',
        startDateLabel: 'Start Date:',
        endDateLabel: 'End Date:',
        statusLabel: 'Status:',
        renewalLabel: 'Next Renewal:',
        cancelDateLabel: 'Cancellation Date:',
        manageText: 'Manage Subscription',
        footerMessage: {
            created:
                'Thank you for choosing Praxis Notes. If you have any questions about your subscription, please contact our support team.',
            updated:
                'If you did not make this change or have any questions, please contact our support team.',
            canceled:
                'We hope to see you again soon. Your data will be retained according to our data retention policy.',
        },
    },
    es: {
        preview: {
            created: 'Tu suscripción a Praxis Notes ha sido activada',
            updated: 'Tu suscripción a Praxis Notes ha sido actualizada',
            canceled: 'Tu suscripción a Praxis Notes ha sido cancelada',
        },
        title: {
            created: 'Suscripción Activada',
            updated: 'Suscripción Actualizada',
            canceled: 'Suscripción Cancelada',
        },
        message: {
            created:
                '¡Gracias por suscribirte a Praxis Notes! Tu suscripción ha sido activada con éxito.',
            updated:
                'Tu suscripción a Praxis Notes ha sido actualizada. Por favor, revisa los detalles a continuación.',
            canceled:
                'Tu suscripción a Praxis Notes ha sido cancelada. Lamentamos verte partir.',
        },
        detailsTitle: 'Detalles de la Suscripción',
        planLabel: 'Plan:',
        priceLabel: 'Precio:',
        startDateLabel: 'Fecha de Inicio:',
        endDateLabel: 'Fecha de Finalización:',
        statusLabel: 'Estado:',
        renewalLabel: 'Próxima Renovación:',
        cancelDateLabel: 'Fecha de Cancelación:',
        manageText: 'Administrar Suscripción',
        footerMessage: {
            created:
                'Gracias por elegir Praxis Notes. Si tienes alguna pregunta sobre tu suscripción, contacta a nuestro equipo de soporte.',
            updated:
                'Si no realizaste este cambio o tienes alguna pregunta, contacta a nuestro equipo de soporte.',
            canceled:
                'Esperamos verte pronto de nuevo. Tus datos se conservarán de acuerdo con nuestra política de retención de datos.',
        },
    },
};

export const SubscriptionStatusEmail = ({
    status,
    planName,
    price,
    startDate,
    endDate,
    nextRenewal,
    cancelDate,
    managementUrl,
    language = 'en',
}: {
    status: StatusType;
    planName: string;
    price: string;
    startDate: string;
    endDate?: string;
    nextRenewal?: string;
    cancelDate?: string;
    managementUrl: string;
    language?: string;
}) => {
    const lang = language === 'es' ? 'es' : 'en';
    const t = translations[lang];
    const statusColor = getStatusColor(status);

    return (
        <Html lang={lang}>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                ...THEME.colors,
                                statusColor,
                            },
                            spacing: THEME.spacing,
                        },
                    },
                }}
            >
                <Head />

                <Preview>{t.preview[status]}</Preview>

                <Body className="bg-offwhite text-text font-sans text-base leading-relaxed">
                    {/* Accent bar */}
                    <Section
                        className="bg-statusColor h-1"
                        role="presentation"
                    />

                    <Container className="mx-auto max-w-[600px] rounded-lg bg-white p-24 shadow-sm">
                        {/* Header */}
                        <Heading
                            as="h1"
                            className="mb-16 mt-0 text-center text-2xl font-semibold"
                        >
                            {t.title[status]}
                        </Heading>

                        <Text className="mb-24">{t.message[status]}</Text>

                        {/* Subscription Details */}
                        <Section className="mb-24">
                            <Heading
                                as="h2"
                                className="mb-16 text-xl font-semibold"
                            >
                                {t.detailsTitle}
                            </Heading>

                            <Text className="my-8">
                                <strong>{t.planLabel}</strong> {planName}
                            </Text>
                            <Text className="my-8">
                                <strong>{t.priceLabel}</strong> {price}
                            </Text>
                            <Text className="my-8">
                                <strong>{t.startDateLabel}</strong> {startDate}
                            </Text>
                            {endDate && (
                                <Text className="my-8">
                                    <strong>{t.endDateLabel}</strong> {endDate}
                                </Text>
                            )}
                            {nextRenewal && status !== 'canceled' && (
                                <Text className="my-8">
                                    <strong>{t.renewalLabel}</strong>{' '}
                                    {nextRenewal}
                                </Text>
                            )}
                            {cancelDate && status === 'canceled' && (
                                <Text className="my-8">
                                    <strong>{t.cancelDateLabel}</strong>{' '}
                                    {cancelDate}
                                </Text>
                            )}
                        </Section>

                        {status !== 'canceled' && (
                            <Section className="mb-24 text-center">
                                <Button
                                    href={managementUrl}
                                    rel="noopener noreferrer"
                                    className="bg-brand rounded-lg px-6 py-3 font-medium text-white"
                                >
                                    {t.manageText}
                                </Button>
                            </Section>
                        )}

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
                            {t.footerMessage[status]}
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
