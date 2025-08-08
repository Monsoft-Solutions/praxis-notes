import { useState } from 'react';

import { Button } from '@shared/ui/button.ui';

import { api } from '@api/providers/web';

type ChatSuggestedQuestionsProps = {
    sessionId: string;
    onQuestionSelect: (question: string) => void;
    className?: string;
};

export function ChatSuggestedQuestions({
    sessionId,
    onQuestionSelect,
    className,
}: ChatSuggestedQuestionsProps) {
    const [suggestedQuestions, setSuggestedQuestions] = useState<
        { id: string; questionText: string }[] | undefined
    >(undefined);

    api.chat.onSuggestedQuestionsCreated.useSubscription(
        { sessionId },

        {
            onData: (data) => {
                setSuggestedQuestions(data);
            },
        },
    );

    if (!suggestedQuestions) return null;

    // Full ABA color palette with proper thumb tack colors
    const colorSchemes = [
        {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            hover: 'hover:bg-blue-100',
            text: 'text-blue-700',
            tack: 'bg-blue-400',
        },
        {
            bg: 'bg-green-50',
            border: 'border-green-200',
            hover: 'hover:bg-green-100',
            text: 'text-green-700',
            tack: 'bg-green-400',
        },
        {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            hover: 'hover:bg-orange-100',
            text: 'text-orange-700',
            tack: 'bg-orange-400',
        },
        {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            hover: 'hover:bg-yellow-100',
            text: 'text-yellow-800',
            tack: 'bg-yellow-400',
        },
    ];

    return (
        <div className={`relative w-full max-w-4xl ${className ?? ''}`}>
            {/* Very subtle background decorations */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div
                    className="absolute left-10 top-20 h-8 w-8 rounded-full border-2 border-blue-200 opacity-20"
                    style={{ transform: 'rotate(0.1deg)' }}
                ></div>
                <div className="absolute bottom-32 right-16 h-6 w-6 rounded border border-green-200 opacity-30"></div>
                <div className="absolute bottom-20 left-1/4 h-2 w-2 rounded-full bg-orange-200 opacity-40"></div>
            </div>

            {/* Simple header */}
            <div className="mb-6 text-center">
                <h3 className="font-quicksand mb-2 text-lg font-semibold text-gray-700">
                    Need some inspiration?
                </h3>
                <p className="font-nunito text-sm text-gray-600">
                    Here are some questions to get you started
                </p>
            </div>

            {/* Questions grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {suggestedQuestions.map((question, index) => {
                    // Use full color palette
                    const colorScheme =
                        colorSchemes[index % colorSchemes.length];

                    // Different thumb tack styles for variety
                    const thumbTackStyle = index % 3;

                    return (
                        <div key={question.id} className="group relative">
                            {/* Different thumb tack styles for visual variety */}
                            {thumbTackStyle === 0 && (
                                // Round thumb tack
                                <div className="absolute -top-2 left-1/2 z-10 h-4 w-4 -translate-x-1/2 transform">
                                    <div
                                        className={`h-full w-full rounded-full ${colorScheme.tack} shadow-md`}
                                    ></div>
                                    <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></div>
                                </div>
                            )}

                            {thumbTackStyle === 1 && (
                                // Square thumb tack
                                <div
                                    className={`absolute -top-1.5 right-8 h-3 w-3 rotate-45 transform ${colorScheme.tack} z-10 shadow-md`}
                                ></div>
                            )}

                            {thumbTackStyle === 2 && (
                                // Triangle thumb tack
                                <div className="absolute -top-2 left-8 z-10">
                                    <div
                                        className="h-0 w-0 border-b-4 border-l-2 border-r-2 border-l-transparent border-r-transparent shadow-sm"
                                        style={{
                                            borderBottomColor: colorScheme.tack
                                                .replace('bg-', '')
                                                .includes('blue')
                                                ? '#60a5fa'
                                                : colorScheme.tack
                                                        .replace('bg-', '')
                                                        .includes('green')
                                                  ? '#4ade80'
                                                  : colorScheme.tack
                                                          .replace('bg-', '')
                                                          .includes('orange')
                                                    ? '#fb923c'
                                                    : '#facc15',
                                        }}
                                    ></div>
                                </div>
                            )}

                            <Button
                                variant="ghost"
                                className={`relative h-auto w-full border-2 p-6 text-left ${colorScheme.bg} ${colorScheme.border} ${colorScheme.hover} ${colorScheme.text} whitespace-normal transition-all hover:-translate-y-1 hover:shadow-lg group-hover:shadow-xl`}
                                style={{
                                    borderRadius: `${16 + (index % 4)}px ${20 + (index % 3)}px ${14 + (index % 4)}px ${22 + (index % 3)}px`,
                                }}
                                onClick={() => {
                                    onQuestionSelect(question.questionText);
                                }}
                            >
                                {/* Content with proper spacing for thumb tacks */}
                                <div className="pt-2">
                                    <span className="font-nunito block whitespace-normal break-words text-sm leading-relaxed">
                                        {question.questionText}
                                    </span>
                                </div>
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Decorative footer note */}
            <div className="mt-8 text-center">
                <p
                    className="font-nunito inline-block rounded-full border border-gray-200 bg-white/60 px-4 py-2 text-xs text-gray-500"
                    style={{ borderRadius: '15px 18px 12px 20px' }}
                >
                    Or type your own question in the input below
                </p>
            </div>
        </div>
    );
}
