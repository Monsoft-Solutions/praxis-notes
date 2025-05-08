import { FormEvent, useState } from 'react';
import { Button } from '@ui/button.ui';
import { Textarea } from '@ui/textarea.ui';
import { cn } from '@css/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@ui/dropdown-menu.ui';
import { Brain, ChevronDown, FastForward, Send, Sparkles } from 'lucide-react';

import { AiGenerationQualitySelector } from '@src/ai/schemas';

type ChatInputProps = {
    onSend: (message: string, model: AiGenerationQualitySelector) => void;
    isLoading?: boolean;
    placeholder?: string;
    model?: AiGenerationQualitySelector;
    onModelChange?: (model: AiGenerationQualitySelector) => void;
};

export function ChatInputComponent({
    onSend,
    isLoading = false,
    placeholder = 'How can I help you today?',
    model = 'Smart',
    onModelChange,
}: ChatInputProps) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (input.trim() && !isLoading) {
            onSend(input, modelSelected);
            setInput('');
        }
    };

    const [modelSelected, setModelSelected] =
        useState<AiGenerationQualitySelector>(model);

    const handleModelChange = (newModel: AiGenerationQualitySelector) => {
        setModelSelected(newModel);
        if (onModelChange) {
            onModelChange(newModel);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="relative">
                <div
                    aria-label="Write your prompt"
                    className="max-h-96 min-h-[3rem] w-full overflow-y-auto break-words"
                >
                    <Textarea
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                        }}
                        placeholder={placeholder}
                        className={cn(
                            'max-w-[60ch] resize-none break-words border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                            isLoading && 'opacity-50',
                        )}
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className="flex w-full items-center gap-2.5">
                <div className="relative flex min-w-0 flex-1 shrink items-center gap-2">
                    {/* <div className="relative shrink-0">
                        <div>
                            <div className="flex items-center">
                                <div className="flex shrink-0">
                                    <button
                                        className="text-text-300 border-border-300 hover:text-text-200/90 hover:bg-bg-100 relative inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg border px-[7.5px]"
                                        type="button"
                                        aria-label="Open attachments menu"
                                    >
                                        <div className="flex flex-row items-center justify-center gap-1">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                viewBox="0 0 256 256"
                                            >
                                                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                                            </svg>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div> */}
                    {/* <div>
                        <div className="relative shrink-0">
                            <div>
                                <div className="flex items-center">
                                    <div className="flex shrink-0">
                                        <button
                                            className="text-text-300 border-border-300 hover:text-text-200/90 hover:bg-bg-100 relative inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg border px-[7.5px]"
                                            type="button"
                                            aria-label="Open tools menu"
                                        >
                                            <div className="flex flex-row items-center justify-center gap-1">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    viewBox="0 0 256 256"
                                                >
                                                    <path d="M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24A16,16,0,1,1,88,80,16,16,0,0,1,104,64ZM216,168H199a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h97a32,32,0,0,0,62,0h17a8,8,0,0,0,0-16Zm-48,24a16,16,0,1,1,16-16A16,16,0,0,1,168,192Z"></path>
                                                </svg>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
                <div className="-m-1 shrink-0 overflow-hidden p-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="border-0.5 text-text-100 hover:bg-bg-100 hover:border-border-400 relative ml-1.5 inline-flex h-7 shrink-0 items-center justify-center gap-[0.175em] rounded-md border-transparent px-1.5 py-1 text-sm opacity-80 transition hover:opacity-100">
                            <div className="inline-flex h-[14px] items-baseline gap-[3px] text-[14px] leading-none">
                                <div className="flex flex-row items-center justify-center gap-[4px]">
                                    <div className="flex select-none flex-row items-center justify-center gap-[4px] whitespace-nowrap tracking-tight">
                                        {modelSelected === 'Fast' && (
                                            <FastForward className="text-primary size-4" />
                                        )}
                                        {modelSelected === 'Smart' && (
                                            <Sparkles className="text-primary size-4" />
                                        )}
                                        {modelSelected === 'Genius' && (
                                            <Brain className="text-primary size-4" />
                                        )}
                                        {modelSelected}
                                    </div>
                                </div>
                            </div>
                            <ChevronDown className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => {
                                    handleModelChange('Fast');
                                }}
                            >
                                <FastForward className="text-primary size-4" />
                                Fast
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    handleModelChange('Smart');
                                }}
                            >
                                <Sparkles className="text-primary size-4" />
                                Smart
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    handleModelChange('Genius');
                                }}
                            >
                                <Brain className="text-primary size-4" />
                                Genius
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!input.trim() || isLoading}
                        className="bg-primary hover:bg-primary-200 relative flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-md font-medium transition-colors active:scale-95 disabled:opacity-50"
                    >
                        <Send className="size-4 text-white" />
                        <span className="sr-only">Send message</span>
                    </Button>
                </div>
            </div>
        </form>
    );
}
