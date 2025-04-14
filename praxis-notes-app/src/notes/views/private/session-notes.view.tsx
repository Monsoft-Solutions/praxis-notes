import { Link } from '@tanstack/react-router';

import { ChevronRight } from 'lucide-react';

import { NotesEditor } from '@src/notes/components';

import { Route } from '@routes/_private/_app/clients/$clientId/sessions/$sessionId/notes';

import { api } from '@api/providers/web';

export function SessionNotesView() {
    const { sessionId } = Route.useParams();

    const { data: sessionQuery } = api.clientSession.getClientSession.useQuery({
        sessionId,
    });

    if (!sessionQuery) return null;
    if (sessionQuery.error) return null;
    const { data: session } = sessionQuery;

    const { client, notes } = session;

    const notesContent = notes ?? '';

    return (
        <div className="container mx-auto space-y-6 py-6">
            <nav className="flex items-center text-sm">
                <Link
                    to="/clients"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    Clients
                </Link>

                <ChevronRight className="text-muted-foreground mx-2 h-4 w-4" />
                <Link
                    // to="/clients/$clientId"
                    // params={{ clientId }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    {client.firstName}
                </Link>

                <ChevronRight className="text-muted-foreground mx-2 h-4 w-4" />

                <Link
                    to="/clients/$clientId/sessions"
                    params={{ clientId: client.id }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    Sessions
                </Link>

                <ChevronRight className="text-muted-foreground mx-2 h-4 w-4" />

                <Link
                    to="/clients/$clientId/sessions/$sessionId"
                    params={{ clientId: client.id, sessionId }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    {new Date(session.sessionDate).toLocaleDateString()}
                </Link>

                <ChevronRight className="text-muted-foreground mx-2 h-4 w-4" />

                <span className="text-foreground font-medium">Notes</span>
            </nav>

            <div className="mt-8 space-y-4">
                <h1 className="text-2xl font-bold">Session Notes</h1>

                <p className="text-muted-foreground">
                    View, edit, and generate session notes for your therapy
                    session.
                </p>

                <NotesEditor sessionId={sessionId} initialData={notesContent} />
            </div>
        </div>
    );
}
