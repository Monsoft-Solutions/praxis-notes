import { Link, useNavigate } from '@tanstack/react-router';

import { Button } from '@ui/button.ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@ui/dropdown-menu.ui';

import { ListTodo, MoreVertical, Pencil, Plus, User } from 'lucide-react';

import { api } from '@api/providers/web';

import { TourStepId } from '@shared/types/tour-step-id.type';
import { useEffect } from 'react';
import { ViewContainer } from '@shared/ui';

const addClientButtonId: TourStepId = 'add-client-button';
const viewSessionsButtonId: TourStepId = 'view-sessions-button';

export const ClientsView = () => {
    const navigate = useNavigate();

    const { data: clientsQuery } = api.client.getClients.useQuery();

    useEffect(() => {
        const handler = () => {
            if (!clientsQuery) return null;
            const { error } = clientsQuery;
            if (error) return null;
            const { data: clients } = clientsQuery;

            const firstClient = clients.at(0);

            if (!firstClient) return null;

            void navigate({
                to: '/clients/$clientId/sessions',
                params: { clientId: firstClient.id },
            });
        };

        window.addEventListener('navigateToFirstClientSessions', handler);

        return () => {
            window.removeEventListener(
                'navigateToFirstClientSessions',
                handler,
            );
        };
    }, [navigate, clientsQuery]);

    if (!clientsQuery) return null;
    const { error } = clientsQuery;
    if (error) return null;
    const { data: clients } = clientsQuery;

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-green-50">
            {/* Very subtle background decorations */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="hand-drawn-decorative-circle rotate-decorative-right absolute left-10 top-20 hidden h-12 w-12 border-blue-200 sm:block"></div>
                <div className="hand-drawn-decorative-square absolute bottom-32 right-16 hidden h-8 w-8 border-green-200 sm:block"></div>
                <div className="absolute bottom-20 left-1/4 hidden h-2 w-2 rounded-full bg-orange-200 opacity-50 sm:block"></div>
            </div>

            <ViewContainer>
                <div className="flex items-center justify-between">
                    <h1 className="text-hand-drawn-title text-3xl">Clients</h1>

                    <Button
                        asChild
                        className="hand-drawn-button text-foreground font-quicksand bg-blue-400 font-semibold hover:bg-blue-500"
                    >
                        <Link to="/clients/new" id={addClientButtonId}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Client
                        </Link>
                    </Button>
                </div>

                {clients.length === 0 ? (
                    <div className="hand-drawn-card border-blue-200 text-center">
                        <div className="thumb-tack-round text-blue-400"></div>

                        <h3 className="font-quicksand mb-2 text-lg font-semibold">
                            No Clients Yet
                        </h3>

                        <p className="text-hand-drawn-body text-muted-foreground mb-6">
                            Add your first client to get started
                        </p>

                        <Button
                            asChild
                            className="hand-drawn-button text-foreground font-quicksand bg-blue-400 font-semibold hover:bg-blue-500"
                        >
                            <Link to="/clients/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Client
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {clients.map((client, index) => (
                            <div
                                key={client.id}
                                className="hand-drawn-card hover-lift border-blue-200"
                            >
                                <div className="thumb-tack-round text-blue-400"></div>

                                <div className="flex items-center justify-between">
                                    <Link
                                        to="/clients/$clientId/sessions"
                                        params={{ clientId: client.id }}
                                        className="hover:text-primary flex items-center space-x-4 transition-colors"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-blue-100">
                                            <User className="h-5 w-5 text-blue-500" />
                                        </div>

                                        <div>
                                            <div className="font-quicksand font-medium">
                                                {client.firstName}{' '}
                                                {client.lastName}
                                            </div>

                                            <div className="text-hand-drawn-body text-muted-foreground text-sm">
                                                {client.isDraft
                                                    ? 'Draft'
                                                    : client.isActive
                                                      ? 'Active'
                                                      : 'Inactive'}
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="flex items-center space-x-2">
                                        {client.isDraft ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="hand-drawn-button text-foreground font-quicksand bg-green-300 font-semibold hover:bg-green-400"
                                            >
                                                <Link
                                                    to="/clients/new"
                                                    search={{
                                                        fromDraft: client.id,
                                                    }}
                                                >
                                                    <ListTodo className="mr-1 h-4 w-4" />
                                                    Complete
                                                </Link>
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="hand-drawn-button text-foreground font-quicksand bg-blue-400 font-semibold hover:bg-blue-500"
                                                    asChild
                                                >
                                                    <Link
                                                        to="/clients/$clientId/sessions/new"
                                                        params={{
                                                            clientId: client.id,
                                                        }}
                                                    >
                                                        <Plus className="mr-1 h-4 w-4" />
                                                        New Session
                                                    </Link>
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                to="/clients/$clientId/edit"
                                                                params={{
                                                                    clientId:
                                                                        client.id,
                                                                }}
                                                                className="flex w-full items-center"
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit Client
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            id={
                                                                index === 0
                                                                    ? viewSessionsButtonId
                                                                    : undefined
                                                            }
                                                            asChild
                                                        >
                                                            <Link
                                                                to="/clients/$clientId/sessions"
                                                                params={{
                                                                    clientId:
                                                                        client.id,
                                                                }}
                                                                className="flex w-full items-center"
                                                            >
                                                                <ListTodo className="mr-2 h-4 w-4" />
                                                                View Sessions
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ViewContainer>
        </div>
    );
};
