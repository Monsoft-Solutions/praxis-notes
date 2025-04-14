import { useEffect, useState } from 'react';

import ReactMarkdown from 'react-markdown';

import { Save, Download, RefreshCw } from 'lucide-react';

import { Button } from '@ui/button.ui';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';

import { Textarea } from '@ui/textarea.ui';

import { api } from '@api/providers/web';
import { toast } from 'sonner';

type NotesEditorProps = {
    sessionId: string;
    initialData?: string;
};

export function NotesEditor({ sessionId, initialData }: NotesEditorProps) {
    const { mutateAsync: generateNotes } =
        api.notes.generateNotes.useMutation();

    const { mutateAsync: updateNotes } = api.notes.updateNotes.useMutation();

    const [editorValue, setEditorValue] = useState('');

    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

    // Handle generate notes
    const handleGenerate = async () => {
        const generateNotesResult = await generateNotes({ sessionId });

        if (generateNotesResult.error) {
            toast.error('Failed to generate notes');
            return;
        }

        setEditorValue(generateNotesResult.data);
    };

    // Handle save notes
    const handleSave = async () => {
        try {
            await updateNotes({ sessionId, notes: editorValue });
        } catch (error) {
            console.error('Failed to save notes:', error);
        }
    };

    // Handle download notes as markdown
    const handleDownload = () => {
        const blob = new Blob([editorValue], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-notes-${sessionId}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        if (initialData) {
            setEditorValue(initialData);
        }
    }, [initialData]);

    const hasNotes = initialData !== undefined || editorValue.length > 0;

    return (
        <Card className="h-full w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Session Notes</span>
                    <div className="flex gap-2">
                        {!hasNotes && (
                            <Button
                                onClick={() => {
                                    void handleGenerate();
                                }}
                                variant="secondary"
                            >
                                Generate Notes
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
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        )}

                        <Button
                            onClick={handleDownload}
                            disabled={!editorValue}
                            variant="outline"
                            size="icon"
                            title="Download Notes"
                        >
                            <Download className="h-4 w-4" />
                        </Button>

                        <Button
                            onClick={() => {
                                void handleSave();
                            }}
                            disabled={!editorValue}
                            variant="default"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Save Notes
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent>
                {hasNotes ? (
                    <div className="w-full">
                        <div className="mb-4 flex border-b">
                            <button
                                className={`px-4 py-2 ${activeTab === 'edit' ? 'border-primary border-b-2 font-medium' : 'text-muted-foreground'}`}
                                onClick={() => {
                                    setActiveTab('edit');
                                }}
                            >
                                Edit
                            </button>
                            <button
                                className={`px-4 py-2 ${activeTab === 'preview' ? 'border-primary border-b-2 font-medium' : 'text-muted-foreground'}`}
                                onClick={() => {
                                    setActiveTab('preview');
                                }}
                            >
                                Preview
                            </button>
                        </div>

                        {activeTab === 'edit' ? (
                            <Textarea
                                className="min-h-[500px] font-mono text-sm"
                                value={editorValue}
                                onChange={(e) => {
                                    setEditorValue(e.target.value);
                                }}
                                placeholder="Write or generate notes..."
                            />
                        ) : (
                            <div className="prose min-h-[500px] max-w-none rounded-md border p-4">
                                <ReactMarkdown>{editorValue}</ReactMarkdown>
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
                            onClick={() => {
                                void handleGenerate();
                            }}
                            className="mt-2"
                        >
                            Generate Notes
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
