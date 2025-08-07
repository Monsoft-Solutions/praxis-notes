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
            className="flex flex-col gap-3"
            id="chat-input"
        >
            {/* Attachments preview */}
            {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {attachments.map((file, idx) => (
                        <div
                            key={idx}
                            className="relative rounded-lg border-2 border-blue-200 bg-white p-2"
                            style={{
                                borderRadius: '8px 10px 9px 11px',
                            }}
                        >
                            <Thumbnail file={file} />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0"
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

            {/* Main input container */}
            <div
                className="relative rounded-xl border-2 border-orange-200 bg-white transition-colors focus-within:border-orange-300"
                style={{
                    borderRadius: '15px 18px 14px 20px',
                }}
            >
                {/* Input area */}
                <div className="flex min-h-[3rem] items-end gap-2 p-3">
                    {/* Attachment button */}
                    <div className="relative shrink-0">
                        <Attach
                            className="relative overflow-visible"
                            setAttachment={setAttachments}
                            disabled={isLoading}
                        >
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg border-2 border-blue-200 bg-white text-blue-500 transition-all hover:border-blue-300 hover:bg-blue-50"
                                style={{
                                    borderRadius: '8px 10px 9px 11px',
                                }}
                                disabled={isLoading}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                        </Attach>

                        {numAttachments > 0 && (
                            <Badge className="font-quicksand absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 p-0 text-xs font-semibold text-white">
                                {numAttachments > 9 ? '9+' : numAttachments}
                            </Badge>
                        )}
                    </div>

                    {/* Text input */}
                    <div className="min-h-[2rem] flex-1">
                        <Textarea
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                            }}
                            placeholder={placeholder}
                            className={cn(
                                'font-nunito max-h-32 min-h-[2rem] resize-none border-0 bg-transparent p-0 text-sm placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0',
                                isLoading && 'opacity-50',
                            )}
                            disabled={isLoading}
                            rows={1}
                        />
                    </div>

                    {/* Model selector */}
                    <div className="shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    className={cn(
                                        'font-quicksand h-8 rounded-lg px-3 font-semibold text-white transition-all hover:shadow-md',
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
                                className="rounded-xl border-2 border-blue-200"
                                style={{
                                    borderRadius: '15px 18px 14px 20px',
                                }}
                            >
                                <DropdownMenuItem
                                    onClick={() => {
                                        handleModelChange('Fast');
                                    }}
                                    className="font-nunito"
                                >
                                    <FastForward className="mr-2 h-4 w-4 text-green-500" />
                                    Fast
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        handleModelChange('Smart');
                                    }}
                                    className="font-nunito"
                                >
                                    <Sparkles className="mr-2 h-4 w-4 text-blue-500" />
                                    Smart
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        handleModelChange('Genius');
                                    }}
                                    className="font-nunito"
                                >
                                    <Brain className="mr-2 h-4 w-4 text-orange-500" />
                                    Genius
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        handleModelChange('File');
                                    }}
                                    className="font-nunito"
                                >
                                    <FileText className="mr-2 h-4 w-4 text-yellow-600" />
                                    File
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Send button */}
                    <div className="shrink-0">
                        <Button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="font-quicksand h-8 w-8 rounded-lg bg-green-400 p-0 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-green-500 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
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
