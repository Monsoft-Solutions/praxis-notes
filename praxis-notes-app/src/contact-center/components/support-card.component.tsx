import React, { useRef } from 'react';
import {
    LifeBuoy,
    Phone,
    Mail,
    HelpCircle,
    MessageSquare,
    Lightbulb,
    Bug,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@ui/card.ui';
import { Button } from '@ui/button.ui';
import { FeedbackDialog } from '@src/contact-center/components/feedback-dialog.component';

type SupportOptionProps = {
    icon: React.ReactNode;
    label: string;
    href?: string;
    onClick?: () => void;
};

const SupportOption: React.FC<SupportOptionProps> = ({
    icon,
    label,
    href,
    onClick,
}) => {
    const content = (
        <div className="flex flex-col items-center justify-center gap-2 p-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                {icon}
            </div>
            <span className="text-sm font-medium">{label}</span>
        </div>
    );

    if (href) {
        return (
            <a
                href={href}
                className="hover:bg-muted/50 flex flex-col items-center rounded-md transition-colors"
                onClick={onClick}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={
                    href.startsWith('http') ? 'noopener noreferrer' : undefined
                }
            >
                {content}
            </a>
        );
    }

    return (
        <Button
            variant="ghost"
            className="hover:bg-muted/50 flex h-auto flex-col items-center rounded-md transition-colors"
            onClick={onClick}
        >
            {content}
        </Button>
    );
};

export const SupportCard: React.FC = () => {
    const suggestionButtonRef = useRef<HTMLButtonElement>(null);
    const bugButtonRef = useRef<HTMLButtonElement>(null);

    return (
        <Card className="w-full">
            <CardHeader className="pb-6">
                <CardTitle>
                    <div className="flex items-start justify-start gap-2">
                        <LifeBuoy className="text-primary size-5" />
                        <span>Do you need help?</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    <SupportOption
                        icon={<Phone className="text-primary size-6" />}
                        label="Call us"
                        href="tel:+13057974357"
                    />
                    <SupportOption
                        icon={<MessageSquare className="text-primary size-6" />}
                        label="WhatsApp"
                        href="https://wa.me/13057974357"
                    />
                    <SupportOption
                        icon={<Mail className="text-primary size-6" />}
                        label="E-mail"
                        href="mailto:support@praxisnotes.com"
                    />
                    <SupportOption
                        icon={<HelpCircle className="text-primary size-6" />}
                        label="Guides"
                        href="https://docs.praxisnotes.com"
                    />
                    <SupportOption
                        icon={<Lightbulb className="text-primary size-6" />}
                        label="Suggestions"
                        onClick={() => {
                            suggestionButtonRef.current?.click();
                        }}
                    />
                    <SupportOption
                        icon={<Bug className="text-primary size-6" />}
                        label="Report Bug"
                        onClick={() => {
                            bugButtonRef.current?.click();
                        }}
                    />
                </div>
            </CardContent>

            <FeedbackDialog
                initialType="suggestion"
                trigger={
                    <button
                        ref={suggestionButtonRef}
                        className="hidden"
                        type="button"
                    />
                }
            />

            <FeedbackDialog
                initialType="bug"
                trigger={
                    <button
                        ref={bugButtonRef}
                        className="hidden"
                        type="button"
                    />
                }
            />
        </Card>
    );
};
