import { useState } from 'react';

import { Button } from '@shared/ui/button.ui';

import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip.ui';

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

    return (
        // {isLoading && (
        // <div className={`flex w-full flex-col space-y-2 ${className ?? ''}`}>

        //         <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        //             <span className="h-3 w-3">🤖</span>
        //             <span>Loading suggested questions...</span>
        //         </p>
        //     {[1, 2, 3, 4].map((i) => (
        //         <Button
        //             key={i}
        //             variant="outline"
        //             className="bg-muted h-auto animate-pulse justify-start px-3 py-2 text-left"
        //             disabled
        //         >
        //             <div className="h-4 w-full" />
        //         </Button>
        //     ))}
        // </div>)
        <div className={`w-full ${className ?? ''}`}>
            <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs">
                <span className="h-3 w-3">🤖</span>
                <span>Try asking about:</span>
            </p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {suggestedQuestions.map((question) => (
                    <Tooltip key={question.id}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="hover:bg-primary/5 h-auto w-full justify-start overflow-hidden whitespace-normal break-words px-3 py-2 text-left"
                                onClick={() => {
                                    onQuestionSelect(question.questionText);
                                }}
                            >
                                <span className="line-clamp-2 text-xs">
                                    {question.questionText}
                                </span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{question.questionText}</TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </div>
    );
}
