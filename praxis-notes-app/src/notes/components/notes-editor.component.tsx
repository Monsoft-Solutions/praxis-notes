import { useCallback, useEffect, useState } from 'react';

import { Save, Download, Check, X } from 'lucide-react';

import { Button } from '@ui/button.ui';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';

import { Textarea } from '@ui/textarea.ui';

import { Spinner } from '@shared/ui/spinner.ui';

import { api } from '@api/providers/web';
import { toast } from 'sonner';
import { trackEvent } from '@analytics/providers';

import { TourStepId } from '@shared/types/tour-step-id.type';

import { Route } from '@routes/_private/_app/clients/$clientId/sessions/$sessionId/index.tsx';
import { NotesActions } from './notes-actions.component';
import { TransformationType } from '../services/notes-transform.service';

type NotesEditorProps = {
    sessionId: string;
    initialData?: string;
};

type TabType = 'edit' | 'spanish';

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

    const { mutateAsync: transformNotes } =
        api.notes.transformNotes.useMutation();

    const [editorValue, setEditorValue] = useState('');
    const [spanishValue, setSpanishValue] = useState<string | undefined>(
        undefined,
    );
    const [hasTranslated, setHasTranslated] = useState(false);

    const [activeTab, setActiveTab] = useState<TabType>('edit');
    const [isTranslating, setIsTranslating] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);

    const [isGeneratingNotes, setIsGeneratingNotes] = useState(
        isGenerating ?? false,
    );

    const [isSavingNotes, setIsSavingNotes] = useState(false);

    // State for reviewing transformed notes
    const [transformedNotesPreview, setTransformedNotesPreview] = useState<
        string | undefined
    >(undefined);
    const [isReviewingTransformation, setIsReviewingTransformation] =
        useState(false);

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

    // Handle accepting the transformation
    const handleAcceptTransformation = useCallback(() => {
        if (transformedNotesPreview !== undefined) {
            setEditorValue(transformedNotesPreview);
            setHasTranslated(false); // Reset translation state
            setSpanishValue('');
        }
        setTransformedNotesPreview(undefined);
        setIsReviewingTransformation(false);
        trackEvent('notes', 'notes_transform_accept');
    }, [transformedNotesPreview]);

    // Handle canceling the transformation
    const handleCancelTransformation = useCallback(() => {
        setTransformedNotesPreview(undefined);
        setIsReviewingTransformation(false);
        trackEvent('notes', 'notes_transform_cancel');
    }, []);

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

        const { error: generateNotesError } = await generateNotes({
            sessionId,
        });

        setIsGeneratingNotes(false);

        if (generateNotesError) {
            if (generateNotesError === 'INSUFFICIENT_CREDITS') {
                toast.error('Insufficient credits', {
                    description:
                        "you don't have enough credits to generate notes",
                });
            } else {
                toast.error('Failed to generate notes');
            }

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

    // Handle note transformations
    const handleTransformAction = useCallback(
        async (actionType: string, customInstructions?: string) => {
            if (actionType === 'regenerate') {
                void handleGenerate();
                return;
            }

            if (!editorValue) {
                toast.error('No notes to transform');
                return;
            }

            try {
                setIsTransforming(true);

                const result = await transformNotes({
                    notes: editorValue,
                    transformationType: actionType as TransformationType,
                    ...(customInstructions && { customInstructions }),
                    sessionId,
                });

                if ('error' in result && result.error) {
                    toast.error('Failed to transform notes');
                    return;
                }

                if (result.data.notes) {
                    setTransformedNotesPreview(result.data.notes);
                    setIsReviewingTransformation(true);
                    // We will move the reset of Spanish translation to when the user accepts the changes.
                    // setEditorValue(result.data.notes);
                }

                // Reset Spanish translation when we modify the English content
                // setHasTranslated(false);
                // setSpanishValue('');

                toast.success(`Notes transformed successfully`);
                trackEvent('notes', `notes_transform_${actionType}`);
            } catch (error) {
                console.error('Error transforming notes:', error);
                toast.error('Failed to transform notes');
            } finally {
                setIsTransforming(false);
            }
        },
        [editorValue, transformNotes, handleGenerate, sessionId],
    );

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
                        {isReviewingTransformation ? (
                            <>
                                <Button
                                    onClick={handleCancelTransformation}
                                    variant="outline"
                                    size="icon"
                                    title="Cancel Transformation"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={handleAcceptTransformation}
                                    variant="default"
                                    size="icon"
                                    title="Accept Transformation"
                                    className="bg-green-500 text-white hover:bg-green-600"
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                {activeTab === 'edit' && hasNotes && (
                                    <div className="pb-2">
                                        <NotesActions
                                            onAction={(
                                                actionType,
                                                customInstructions,
                                            ) => {
                                                void handleTransformAction(
                                                    actionType,
                                                    customInstructions,
                                                );
                                            }}
                                            disabled={
                                                !editorValue ||
                                                isTransforming ||
                                                isGeneratingNotes
                                            }
                                        />
                                    </div>
                                )}

                                <Button
                                    id={downloadNotesButtonId}
                                    onClick={handleDownload}
                                    variant="outline"
                                    size="icon"
                                    title="Download Notes"
                                    disabled={
                                        !editorValue ||
                                        isTransforming ||
                                        isGeneratingNotes
                                    }
                                >
                                    <Download className="h-4 w-4" />
                                </Button>

                                <Button
                                    id={saveNotesButtonId}
                                    onClick={() => {
                                        void handleSave();
                                    }}
                                    disabled={
                                        !editorValue ||
                                        isTransforming ||
                                        isGeneratingNotes
                                    }
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
                            </>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent>
                {hasNotes || isGeneratingNotes || isReviewingTransformation ? (
                    <div className="w-full">
                        <div className="mb-4 flex items-center justify-between border-b">
                            <div className="flex">
                                <button
                                    className={`px-4 py-2 ${activeTab === 'edit' ? 'border-primary border-b-2 font-medium' : 'text-muted-foreground'}`}
                                    onClick={() => {
                                        void handleTabChange('edit');
                                    }}
                                    disabled={isReviewingTransformation}
                                >
                                    Edit
                                </button>
                                <button
                                    className={`px-4 py-2 ${activeTab === 'spanish' ? 'border-primary border-b-2 font-medium' : 'text-muted-foreground'}`}
                                    onClick={() => {
                                        void handleTabChange('spanish');
                                    }}
                                    disabled={isReviewingTransformation}
                                >
                                    Translate
                                </button>
                            </div>
                        </div>

                        {activeTab === 'edit' ? (
                            <div className="relative">
                                <Textarea
                                    className="min-h-[500px] font-mono text-sm"
                                    value={
                                        isReviewingTransformation &&
                                        transformedNotesPreview !== undefined
                                            ? transformedNotesPreview
                                            : editorValue
                                    }
                                    onChange={(e) => {
                                        if (isReviewingTransformation) {
                                            // If reviewing, update the preview
                                            setTransformedNotesPreview(
                                                e.target.value,
                                            );
                                        } else {
                                            setEditorValue(e.target.value);
                                            // Reset Spanish translation when English content changes
                                            setHasTranslated(false);
                                        }
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

                                {isTransforming && (
                                    <div className="bg-background/80 absolute inset-0 flex items-center justify-center">
                                        <Spinner className="h-8 w-8" />
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
