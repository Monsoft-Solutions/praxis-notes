import React, { useRef } from 'react';
import { LifeBuoy, Mail, HelpCircle, Lightbulb, Bug } from 'lucide-react';
import { CardTitle } from '@ui/card.ui';
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
        <div className="flex flex-col items-center justify-center gap-3 p-4 transition-all hover:scale-105">
            <div
                className="flex h-14 w-14 items-center justify-center border-2 border-green-200 bg-green-100 shadow-sm"
                style={{
                    borderRadius: '12px 16px 10px 18px',
                }}
            >
                {icon}
            </div>
            <span className="font-quicksand text-center text-sm font-medium text-gray-700">
                {label}
            </span>
        </div>
    );

    if (href) {
        return (
            <a
                href={href}
                className="block rounded-xl border border-green-200 transition-all hover:-translate-y-1 hover:bg-green-50 hover:shadow-md"
                onClick={onClick}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={
                    href.startsWith('http') ? 'noopener noreferrer' : undefined
                }
                style={{
                    borderRadius: '14px 18px 12px 20px',
                }}
            >
                {content}
            </a>
        );
    }

    return (
        <Button
            variant="ghost"
            className="h-auto rounded-xl border border-green-200 p-0 transition-all hover:-translate-y-1 hover:bg-green-50 hover:shadow-md"
            onClick={onClick}
            style={{
                borderRadius: '14px 18px 12px 20px',
            }}
        >
            {content}
        </Button>
    );
};

export const SupportCard: React.FC = () => {
    const suggestionButtonRef = useRef<HTMLButtonElement>(null);
    const bugButtonRef = useRef<HTMLButtonElement>(null);

    return (
        <div
            className="relative w-full rounded-3xl border-2 border-green-200 bg-white p-6 shadow-lg"
            style={{
                borderRadius: '28px 32px 24px 36px',
            }}
        >
            {/* Thumb tack - square style */}
            <div className="absolute -top-1.5 right-8 h-3 w-3 rotate-45 transform bg-green-400 shadow-sm"></div>

            {/* Card header */}
            <div className="pb-6 pt-2">
                <CardTitle className="font-quicksand font-bold text-gray-800">
                    <div className="flex items-start justify-start gap-3">
                        <div
                            className="flex h-8 w-8 items-center justify-center border border-green-300 bg-green-100"
                            style={{
                                borderRadius: '6px 8px 5px 9px',
                            }}
                        >
                            <LifeBuoy className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-lg">Do you need help?</span>
                    </div>
                </CardTitle>
            </div>

            {/* Card content */}
            <div className="pb-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <SupportOption
                        icon={<Mail className="h-7 w-7 text-green-600" />}
                        label="E-mail Support"
                        href="mailto:support@praxisnotes.com"
                    />
                    <SupportOption
                        icon={<HelpCircle className="h-7 w-7 text-green-600" />}
                        label="Help Guides"
                        href="https://docs.praxisnotes.com"
                    />
                    <SupportOption
                        icon={<Lightbulb className="h-7 w-7 text-green-600" />}
                        label="Suggestions"
                        onClick={() => {
                            suggestionButtonRef.current?.click();
                        }}
                    />
                    <SupportOption
                        icon={<Bug className="h-7 w-7 text-green-600" />}
                        label="Report Bug"
                        onClick={() => {
                            bugButtonRef.current?.click();
                        }}
                    />
                </div>
            </div>

            {/* Hidden dialog triggers */}
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

            {/* Card footer */}
            <div>
                <div
                    className="flex items-start rounded-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-4 shadow-sm"
                    style={{
                        borderRadius: '12px 16px 10px 18px',
                        borderStyle: 'dashed',
                    }}
                >
                    <div
                        className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center border border-green-300 bg-green-200"
                        style={{
                            borderRadius: '6px 8px 5px 9px',
                        }}
                    >
                        <HelpCircle className="h-4 w-4 text-green-700" />
                    </div>
                    <p className="font-nunito text-sm leading-relaxed text-gray-700">
                        Need assistance? We&apos;re here to help! We also
                        welcome your feedback on new features and bug reports to
                        improve your experience.
                    </p>
                </div>
            </div>
        </div>
    );
};
