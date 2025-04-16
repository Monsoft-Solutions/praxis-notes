import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Row,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

export const VerificationEmail = ({ url }: { url: string }) => {
    return (
        <Html>
            <Head />

            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                brand: '#2250f4',
                                offwhite: '#fafbfb',
                            },
                            spacing: {
                                0: '0px',
                                20: '20px',
                                45: '45px',
                            },
                        },
                    },
                }}
            >
                <Preview>Praxis Notes Verification</Preview>

                <Body className="bg-offwhite font-sans text-base">
                    <Container className="p-45 bg-white">
                        <Heading className="my-0 text-center leading-8">
                            Welcome to Praxis Notes
                        </Heading>

                        <Section>
                            <Row>
                                <Text className="text-base">
                                    Congratulations! You&apos;re just one step
                                    away from joining our awesome Praxis Notes
                                    community.
                                </Text>
                            </Row>
                        </Section>

                        <Section className="text-center">
                            <Link
                                className="bg-brand rounded-lg px-[18px] py-3 text-white"
                                href={url}
                            >
                                Verify email
                            </Link>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
