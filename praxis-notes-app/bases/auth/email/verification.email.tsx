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

export const VerificationEmail = ({ url }: { url: string }) => (
    <Html lang="en">
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

            <Preview>Verify your email to start using Praxis Notes</Preview>

            <Body className="bg-offwhite text-text font-sans text-base leading-relaxed">
                {/* Accent bar */}
                <Section className="bg-brand h-1" role="presentation" />

                <Container className="mx-auto max-w-[600px] rounded-lg bg-white p-24 shadow-sm">
                    {/* Header */}
                    <Heading
                        as="h1"
                        className="mb-16 mt-0 text-center text-2xl font-semibold"
                    >
                        Welcome to Praxis&nbsp;Notes
                    </Heading>

                    <Text className="mb-24">
                        Thanks for signing up! Click the button below to confirm
                        your email address and activate your account.
                    </Text>

                    <Section className="mb-24 text-center">
                        <Button
                            href={url}
                            rel="noopener noreferrer"
                            aria-label="Verify email address"
                            className="bg-brand rounded-lg px-6 py-3 font-medium text-white"
                        >
                            Verify&nbsp;Email
                        </Button>
                    </Section>

                    {/* Fallback link (hidden ≥640px) */}
                    <Text className="text-center text-xs text-gray-500 sm:hidden">
                        If the button doesn&rsquo;t work, copy &amp; paste this
                        link into your browser:
                        <br />
                        <a
                            href={url}
                            rel="noopener noreferrer"
                            className="break-all"
                        >
                            {url}
                        </a>
                    </Text>

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
                                href="mailto:contact@praxisnotes.com"
                                className="text-brand underline"
                            >
                                contact@praxisnotes.com
                            </a>
                        </Text>
                    </Section>

                    <Text className="mt-24 text-center text-xs text-gray-500">
                        You received this email because you signed up for
                        Praxis&nbsp;Notes. If you didn&rsquo;t create an
                        account, you can safely ignore this message.
                    </Text>
                </Container>
            </Body>
        </Tailwind>
    </Html>
);
