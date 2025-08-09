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
    color: 'blue' | 'purple' | 'orange' | 'green';
};

const SupportOption: React.FC<SupportOptionProps> = ({
    icon,
    label,
    href,
    onClick,
    color,
}) => {
    const colorConfig = {
        blue: {
            iconBg: 'bg-blue-100',
            iconBorder: 'border-blue-300',
            containerBorder: 'border-blue-200',
            hoverBg: 'hover:bg-blue-50',
        },
        purple: {
            iconBg: 'bg-purple-100',
            iconBorder: 'border-purple-300',
            containerBorder: 'border-purple-200',
            hoverBg: 'hover:bg-purple-50',
        },
        orange: {
            iconBg: 'bg-orange-100',
            iconBorder: 'border-orange-300',
            containerBorder: 'border-orange-200',
            hoverBg: 'hover:bg-orange-50',
        },
        green: {
            iconBg: 'bg-green-100',
            iconBorder: 'border-green-300',
            containerBorder: 'border-green-200',
            hoverBg: 'hover:bg-green-50',
        },
    };

    const config = colorConfig[color];

    const content = (
        <div className="flex flex-col items-center justify-center gap-3 p-4 transition-all hover:scale-105">
            <div
                className={`flex h-14 w-14 items-center justify-center border-2 ${config.iconBorder} ${config.iconBg} shadow-sm`}
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
                className={`block border-2 transition-all hover:-translate-y-1 ${config.containerBorder} ${config.hoverBg} hover:shadow-md`}
                onClick={onClick}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={
                    href.startsWith('http') ? 'noopener noreferrer' : undefined
                }
                style={{
                    borderStyle: 'dashed',
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
            className={`h-auto border-2 p-0 transition-all hover:-translate-y-1 ${config.containerBorder} ${config.hoverBg} hover:shadow-md`}
            onClick={onClick}
            style={{
                borderStyle: 'dashed',
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
            className="relative w-full border-4 border-purple-300 bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6 shadow-lg"
            style={{
                borderStyle: 'dashed',
                borderRadius: '28px 32px 24px 36px',
            }}
        >
            {/* Decorative thumb tacks - multiple colors */}
            <div className="absolute -top-2 left-8 h-4 w-4 rounded-full border-2 border-white bg-blue-400 shadow-sm"></div>
            <div className="absolute -top-1.5 right-8 h-3 w-3 rotate-45 transform bg-orange-400 shadow-sm"></div>

            {/* Card header */}
            <div className="pb-6 pt-2">
                <CardTitle className="font-quicksand font-bold text-gray-800">
                    <div className="flex items-start justify-start gap-3">
                        <div
                            className="flex h-8 w-8 items-center justify-center border-2 border-purple-300 bg-purple-100"
                            style={{
                                borderRadius: '6px 8px 5px 9px',
                                borderStyle: 'dashed',
                            }}
                        >
                            <LifeBuoy className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-lg">Do you need help?</span>
                    </div>
                </CardTitle>
            </div>

            {/* Card content */}
            <div className="pb-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <SupportOption
                        icon={<Mail className="h-7 w-7 text-blue-600" />}
                        label="E-mail Support"
                        href="mailto:support@praxisnotes.com"
                        color="blue"
                    />
                    <SupportOption
                        icon={
                            <HelpCircle className="h-7 w-7 text-purple-600" />
                        }
                        label="Help Guides"
                        href="https://docs.praxisnotes.com"
                        color="purple"
                    />
                    <SupportOption
                        icon={<Lightbulb className="h-7 w-7 text-orange-600" />}
                        label="Suggestions"
                        onClick={() => {
                            suggestionButtonRef.current?.click();
                        }}
                        color="orange"
                    />
                    <SupportOption
                        icon={<Bug className="h-7 w-7 text-green-600" />}
                        label="Report Bug"
                        onClick={() => {
                            bugButtonRef.current?.click();
                        }}
                        color="green"
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

            {/* Card footer with improved design */}
            <div>
                <div
                    className="rotate-1 transform border-2 border-yellow-300 bg-gradient-to-r from-yellow-100 to-orange-100 p-3 text-center"
                    style={{
                        borderStyle: 'dotted',
                        borderRadius: '20px 15px 25px 18px',
                    }}
                >
                    <p className="font-nunito text-sm text-gray-700">
                        <span className="font-quicksand font-bold text-orange-600">
                            We&apos;re here to help!
                        </span>{' '}
                        Our support team typically responds within 24 hours
                    </p>
                </div>
            </div>
        </div>
    );
};
