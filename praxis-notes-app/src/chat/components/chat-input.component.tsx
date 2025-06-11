import { FormEvent, useCallback, useState } from 'react';

import { File } from '@shared/schemas';

import { cn } from '@css/utils';

import {
    Brain,
    ChevronDown,
    FastForward,
    FileText,
    Paperclip,
    Send,
    Sparkles,
    X,
} from 'lucide-react';

import { Button } from '@ui/button.ui';
import { Textarea } from '@ui/textarea.ui';
import { Attach } from '@shared/ui/attach.ui';
import { Badge } from '@shared/ui/badge.ui';
import { Thumbnail } from '@shared/ui/thumbnail.ui';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@ui/dropdown-menu.ui';

import { AiGenerationQualitySelector } from '@src/ai/schemas';

type ChatInputProps = {
    onSend: ({
        message,
        attachments,
        model,
    }: {
        message: string;
        attachments: File[];
        model: AiGenerationQualitySelector;
    }) => void;
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

    const [attachments, setAttachments] = useState<File[]>([]);

    const removeAttachment = useCallback((name: string) => {
        setAttachments((prev) => prev.filter((f) => f.name !== name));
    }, []);

    const numAttachments = attachments.length;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (input.trim() && !isLoading) {
            onSend({
                message: input,
                attachments,
                model: modelSelected,
            });
            setInput('');

            setAttachments([]);
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
                            'resize-none break-words rounded-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                            isLoading && 'opacity-50',
                        )}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="flex w-full items-center gap-2.5">
                <div className="flex items-center p-4">
                    <div className="relative">
                        <Attach
                            className="relative overflow-visible"
                            setAttachment={setAttachments}
                            disabled={isLoading}
                        >
                            <Paperclip className="h-5 w-5" />
                        </Attach>

                        {numAttachments > 0 && (
                            <>
                                <Badge
                                    variant="secondary"
                                    className="absolute -right-0.5 -top-0.5 flex size-5 cursor-default items-center justify-center rounded-full px-0 py-0"
                                >
                                    {numAttachments > 9 ? '9+' : numAttachments}
                                </Badge>

                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute left-0 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 p-0"
                                    onClick={() => {
                                        setAttachments([]);
                                    }}
                                >
                                    <X className="size-2.5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {attachments.length > 0 && (
                    <div className="flex gap-2 p-2">
                        {attachments.map((file, idx) => (
                            <div key={idx} className="relative">
                                <Thumbnail file={file} />

                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute left-0 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 p-0"
                                    onClick={() => {
                                        removeAttachment(file.name);
                                    }}
                                >
                                    <X className="size-2.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

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
                                        {modelSelected === 'File' && (
                                            <FileText className="text-primary size-4" />
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
                            <DropdownMenuItem
                                onClick={() => {
                                    handleModelChange('File');
                                }}
                            >
                                <FileText className="text-primary size-4" />
                                File
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
