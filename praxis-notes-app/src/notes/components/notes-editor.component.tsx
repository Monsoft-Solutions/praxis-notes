import { useCallback, useEffect, useState } from 'react';

import { Save, Download, RefreshCw } from 'lucide-react';

import { Button } from '@ui/button.ui';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';

import { Textarea } from '@ui/textarea.ui';

import { Spinner } from '@shared/ui/spinner.ui';

import { api } from '@api/providers/web';
import { toast } from 'sonner';
import { cn } from '@css/utils';
import { trackEvent } from '@analytics/providers';

import { TourStepId } from '@shared/types/tour-step-id.type';

import { Route } from '@routes/_private/_app/clients/$clientId/sessions/$sessionId/index.tsx';

type NotesEditorProps = {
    sessionId: string;
    initialData?: string;
};

type TabType = 'edit' | 'preview' | 'spanish';

const generateNotesButtonId: TourStepId = 'notes-editor-generate-button';
const saveNotesButtonId: TourStepId = 'save-notes-button';
const downloadNotesButtonId: TourStepId = 'download-notes-button';

export function NotesEditor({ sessionId, initialData }: NotesEditorProps) {
    const { isGenerating } = Route.useSearch();

    const { mutateAsync: generateNotes } =
        api.notes.generateNotes.useMutation();

    const { mutateAsync: updateNotes } = api.notes.updateNotes.useMutation();

    const { mutateAsync: translateNotes } =
        api.notes.translateNotes.useMutation();

    const [editorValue, setEditorValue] = useState('');
    const [spanishValue, setSpanishValue] = useState<string | undefined>(
        undefined,
    );
    const [hasTranslated, setHasTranslated] = useState(false);

    const [activeTab, setActiveTab] = useState<TabType>('edit');
    const [isTranslating, setIsTranslating] = useState(false);

    const [isGeneratingNotes, setIsGeneratingNotes] = useState(
        isGenerating ?? false,
    );

    const [isSavingNotes, setIsSavingNotes] = useState(false);

    api.notes.onNotesUpdated.useSubscription(
        {
            sessionId,
        },

        {
            onData: ({ notes, isComplete }) => {
                setEditorValue(notes);

                setIsGeneratingNotes(!isComplete);
            },
        },
    );

    // Handle tab change
    const handleTabChange = useCallback(
        async (tab: TabType) => {
            setActiveTab(tab);

            if (tab === 'spanish' && !hasTranslated && editorValue) {
                setIsTranslating(true);
                try {
                    const result = await translateNotes({
                        notes: editorValue,
                    });

                    if ('error' in result && result.error) {
                        toast.error('Failed to translate notes');
                    } else {
                        // It's a success result
                        const translatedNotes = result.data.notes;
                        setSpanishValue(translatedNotes);
                        setHasTranslated(true);
                    }
                } catch (err) {
                    console.error('Translation error:', err);
                    toast.error('Failed to translate notes');
                } finally {
                    setIsTranslating(false);
                }
            }
        },
        [editorValue, hasTranslated, translateNotes],
    );

    // Handle generate notes
    const handleGenerate = useCallback(async () => {
        setIsGeneratingNotes(true);

        const generateNotesResult = await generateNotes({ sessionId });

        setIsGeneratingNotes(false);

        if (generateNotesResult.error) {
            toast.error('Failed to generate notes');
            return;
        }

        // Reset the Spanish translation whenever we generate new notes
        setHasTranslated(false);
        setSpanishValue('');

        trackEvent('notes', 'notes_generate');
    }, [generateNotes, sessionId]);

    // Handle save notes
    const handleSave = useCallback(async () => {
        setIsSavingNotes(true);

        // Determine which notes to save based on active tab
        const notesToSave =
            activeTab === 'spanish' ? spanishValue : editorValue;

        if (!notesToSave) {
            toast.error('No notes to save');
            setIsSavingNotes(false);
            return;
        }

        const { error } = await updateNotes({
            sessionId,
            notes: notesToSave,
            translateToEnglish: activeTab === 'spanish',
        });

        setIsSavingNotes(false);

        if (error) {
            toast.error('Failed to save notes');
        } else {
            toast.success('Notes saved');

            // If we saved the Spanish version, update the English version too
            if (activeTab === 'spanish' && spanishValue) {
                setEditorValue(spanishValue);
                setHasTranslated(false); // Reset translation state
            }

            trackEvent('notes', 'notes_save');
        }
    }, [updateNotes, sessionId, editorValue, spanishValue, activeTab]);

    // Handle download notes as markdown
    const handleDownload = useCallback(() => {
        // Determine which notes to download based on active tab
        const notesToDownload =
            activeTab === 'spanish' ? spanishValue : editorValue;
        const filenameSuffix = activeTab === 'spanish' ? '-es' : '';

        if (!notesToDownload) {
            toast.error('No notes to download');
            return;
        }

        const blob = new Blob([notesToDownload], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-notes-${sessionId}${filenameSuffix}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [editorValue, spanishValue, sessionId, activeTab]);

    useEffect(() => {
        const handler = () => {
            void handleGenerate();
        };

        window.addEventListener('generateNotes', handler);

        return () => {
            window.removeEventListener('generateNotes', handler);
        };
    }, [handleGenerate]);

    useEffect(() => {
        const handler = () => {
            void handleSave();
        };

        window.addEventListener('saveNotes', handler);

        return () => {
            window.removeEventListener('saveNotes', handler);
        };
    }, [handleSave]);

    useEffect(() => {
        const handler = () => {
            handleDownload();
        };

        window.addEventListener('downloadNotes', handler);

        return () => {
            window.removeEventListener('downloadNotes', handler);
        };
    }, [handleDownload]);

    useEffect(() => {
        if (initialData) {
            setEditorValue(initialData);
        }
    }, [initialData]);

    const hasNotes = initialData !== undefined || editorValue.length > 0;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Session Notes</span>
                    <div className="flex gap-2">
                        {!hasNotes && (
                            <Button
                                id={generateNotesButtonId}
                                className="w-36"
                                onClick={() => {
                                    void handleGenerate();
                                }}
                                variant="secondary"
                                disabled={isGeneratingNotes}
                            >
                                {isGeneratingNotes ? (
                                    <Spinner className="h-4 w-4" />
                                ) : (
                                    'Generate Notes'
                                )}
                            </Button>
                        )}

                        {hasNotes && (
                            <Button
                                onClick={() => {
                                    void handleGenerate();
                                }}
                                variant="outline"
                                size="icon"
                                title="Regenerate Notes"
                            >
                                <RefreshCw
                                    className={cn(
                                        'h-4 w-4',
                                        isGeneratingNotes && 'animate-spin',
                                    )}
                                />
                            </Button>
                        )}

                        <Button
                            id={downloadNotesButtonId}
                            onClick={handleDownload}
                            disabled={!editorValue}
                            variant="outline"
                            size="icon"
                            title="Download Notes"
                        >
                            <Download className="h-4 w-4" />
                        </Button>

                        <Button
                            id={saveNotesButtonId}
                            onClick={() => {
                                void handleSave();
                            }}
                            disabled={!editorValue}
                            variant="default"
                        >
                            {isSavingNotes ? (
                                <Spinner className="h-4 w-4" />
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent>
                {hasNotes || isGeneratingNotes ? (
                    <div className="w-full">
                        <div className="mb-4 flex border-b">
                            <button
                                className={`px-4 py-2 ${activeTab === 'edit' ? 'border-primary border-b-2 font-medium' : 'text-muted-foreground'}`}
                                onClick={() => {
                                    void handleTabChange('edit');
                                }}
                            >
                                Edit
                            </button>
                            <button
                                className={`px-4 py-2 ${activeTab === 'spanish' ? 'border-primary border-b-2 font-medium' : 'text-muted-foreground'}`}
                                onClick={() => {
                                    void handleTabChange('spanish');
                                }}
                            >
                                Translate
                            </button>
                        </div>

                        {activeTab === 'edit' ? (
                            <div className="relative">
                                <Textarea
                                    className="min-h-[500px] font-mono text-sm"
                                    value={editorValue}
                                    onChange={(e) => {
                                        setEditorValue(e.target.value);
                                        // Reset Spanish translation when English content changes
                                        setHasTranslated(false);
                                    }}
                                    placeholder={
                                        !isGeneratingNotes
                                            ? 'Write or generate notes...'
                                            : undefined
                                    }
                                />

                                {isGeneratingNotes && !editorValue && (
                                    <div className="absolute left-4 top-4">
                                        <Spinner className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                {isTranslating ? (
                                    <div className="flex min-h-[500px] items-center justify-center">
                                        <Spinner className="h-8 w-8" />
                                    </div>
                                ) : (
                                    <Textarea
                                        className="min-h-[500px] font-mono text-sm"
                                        value={spanishValue}
                                        onChange={(e) => {
                                            setSpanishValue(e.target.value);
                                        }}
                                        placeholder="Spanish translation will appear here..."
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex min-h-[500px] flex-col items-center justify-center p-8 text-center">
                        <h3 className="mb-2 text-lg font-medium">
                            No Notes Yet
                        </h3>

                        <p className="text-muted-foreground mb-6">
                            Generate notes based on the session data or create
                            your own.
                        </p>

                        <Button
                            id={generateNotesButtonId}
                            onClick={() => {
                                void handleGenerate();
                            }}
                            className="mt-2 w-36"
                            disabled={isGeneratingNotes}
                        >
                            Generate Notes
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
