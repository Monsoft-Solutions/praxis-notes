import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize functionality
    const adjustTextareaHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Reset height to auto to get the actual scrollHeight
        textarea.style.height = 'auto';

        // Calculate the new height
        const scrollHeight = textarea.scrollHeight;
        const lineHeight = 24; // Approximate line height in pixels
        const maxLines = 6; // Maximum number of lines before scrolling
        const minHeight = lineHeight * 1; // Minimum 1 line
        const maxHeight = lineHeight * maxLines; // Maximum 6 lines

        // Set the new height within constraints
        const newHeight = Math.min(
            Math.max(scrollHeight, minHeight),
            maxHeight,
        );
        textarea.style.height = `${newHeight}px`;
    }, []);

    // Adjust height when input changes
    useEffect(() => {
        adjustTextareaHeight();
    }, [input, adjustTextareaHeight]);

    // Adjust height on component mount
    useEffect(() => {
        adjustTextareaHeight();
    }, [adjustTextareaHeight]);

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

    // Handle Enter key submission and Shift+Enter for new lines
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
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
        }
    };

    const getModelIcon = (modelType: AiGenerationQualitySelector) => {
        switch (modelType) {
            case 'Fast':
                return <FastForward className="h-4 w-4 text-green-500" />;
            case 'Smart':
                return <Sparkles className="h-4 w-4 text-blue-500" />;
            case 'Genius':
                return <Brain className="h-4 w-4 text-orange-500" />;
            case 'File':
                return <FileText className="h-4 w-4 text-yellow-600" />;
            default:
                return <Sparkles className="h-4 w-4 text-blue-500" />;
        }
    };

    const getModelColor = (modelType: AiGenerationQualitySelector) => {
        switch (modelType) {
            case 'Fast':
                return 'bg-green-400 hover:bg-green-500 border-green-200';
            case 'Smart':
                return 'bg-blue-400 hover:bg-blue-500 border-blue-200';
            case 'Genius':
                return 'bg-orange-400 hover:bg-orange-500 border-orange-200';
            case 'File':
                return 'bg-yellow-400 hover:bg-yellow-500 border-yellow-200 text-gray-800';
            default:
                return 'bg-blue-400 hover:bg-blue-500 border-blue-200';
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 transition-all duration-200 ease-out"
            id="chat-input"
        >
            {/* Attachments preview */}
            {attachments.length > 0 && (
                <div className="animate-in slide-in-from-bottom-2 flex flex-wrap gap-2 duration-200">
                    {attachments.map((file, idx) => (
                        <div
                            key={idx}
                            className="relative rounded-lg border-2 border-blue-200 bg-white p-2 transition-all hover:border-blue-300 hover:shadow-md"
                            style={{
                                borderRadius: '8px 10px 9px 11px',
                            }}
                        >
                            <Thumbnail file={file} />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 transition-transform hover:scale-110"
                                onClick={() => {
                                    removeAttachment(file.name);
                                }}
                            >
                                <X className="h-2.5 w-2.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Main input container - now with dynamic height */}
            <div
                className="relative rounded-xl border-2 border-orange-200 bg-white transition-all duration-200 ease-out focus-within:border-orange-300 focus-within:shadow-md"
                style={{
                    borderRadius: '15px 18px 14px 20px',
                }}
            >
                {/* Input area - now dynamic */}
                <div className="flex items-end gap-2 p-3 transition-all duration-200 ease-out">
                    {/* Attachment button */}
                    <div className="relative shrink-0 self-end">
                        <Attach
                            className="relative h-8 w-8 overflow-visible rounded-lg border-2 border-blue-200 bg-white text-blue-500 transition-all hover:scale-105 hover:border-blue-300 hover:bg-blue-50"
                            style={{
                                borderRadius: '8px 10px 9px 11px',
                            }}
                            setAttachment={setAttachments}
                            disabled={isLoading}
                        >
                            <Paperclip className="h-4 w-4" />
                        </Attach>

                        {numAttachments > 0 && (
                            <Badge className="font-quicksand animate-in zoom-in-50 absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 p-0 text-xs font-semibold text-white duration-200">
                                {numAttachments > 9 ? '9+' : numAttachments}
                            </Badge>
                        )}
                    </div>

                    {/* Text input - auto-expanding */}
                    <div className="relative flex-1">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className={cn(
                                'font-nunito resize-none border-0 bg-transparent p-0 text-sm transition-all duration-200 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0',
                                'chat-textarea min-h-[24px] leading-6',
                                isLoading && 'opacity-50',
                            )}
                            disabled={isLoading}
                            rows={1}
                            style={{
                                // Initial height will be set by adjustTextareaHeight
                                maxHeight: '144px', // 6 lines * 24px line height
                                minHeight: '24px', // 1 line * 24px line height
                            }}
                        />

                        {/* Subtle hint for Enter behavior */}
                        {input.trim() && !isLoading && (
                            <div className="animate-in fade-in absolute -bottom-5 right-0 text-xs text-gray-400 duration-300">
                                <span className="hidden sm:inline">
                                    Enter to send • Shift+Enter for new line
                                </span>
                                <span className="sm:hidden">⏎ Send</span>
                            </div>
                        )}
                    </div>

                    {/* Model selector */}
                    <div className="shrink-0 self-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    className={cn(
                                        'font-quicksand h-8 rounded-lg px-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-md',
                                        getModelColor(modelSelected),
                                    )}
                                    style={{
                                        borderRadius: '8px 10px 9px 11px',
                                    }}
                                    disabled={isLoading}
                                >
                                    {getModelIcon(modelSelected)}
                                    <span className="ml-1 text-xs">
                                        {modelSelected}
                                    </span>
                                    <ChevronDown className="ml-1 h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="animate-in slide-in-from-top-2 rounded-xl border-2 border-blue-200 duration-200"
                                style={{
                                    borderRadius: '15px 18px 14px 20px',
                                }}
                            >
                                <DropdownMenuItem
                                    onClick={() => {
                                        handleModelChange('Fast');
                                    }}
                                    className="font-nunito transition-colors hover:bg-green-50"
                                >
                                    <FastForward className="mr-2 h-4 w-4 text-green-500" />
                                    Fast
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        handleModelChange('Smart');
                                    }}
                                    className="font-nunito transition-colors hover:bg-blue-50"
                                >
                                    <Sparkles className="mr-2 h-4 w-4 text-blue-500" />
                                    Smart
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        handleModelChange('Genius');
                                    }}
                                    className="font-nunito transition-colors hover:bg-orange-50"
                                >
                                    <Brain className="mr-2 h-4 w-4 text-orange-500" />
                                    Genius
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        handleModelChange('File');
                                    }}
                                    className="font-nunito transition-colors hover:bg-yellow-50"
                                >
                                    <FileText className="mr-2 h-4 w-4 text-yellow-600" />
                                    File
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Send button */}
                    <div className="shrink-0 self-end">
                        <Button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="font-quicksand h-8 w-8 rounded-lg bg-green-400 p-0 font-semibold text-white transition-all hover:-translate-y-0.5 hover:scale-105 hover:bg-green-500 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100"
                            style={{
                                borderRadius: '8px 10px 9px 11px',
                            }}
                        >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send message</span>
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
