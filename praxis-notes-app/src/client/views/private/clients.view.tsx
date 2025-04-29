import { Link } from '@tanstack/react-router';

import { Button } from '@ui/button.ui';

import { User } from 'lucide-react';
import { Pencil } from 'lucide-react';

import { api } from '@api/providers/web';

export const ClientsView = () => {
    const { data: clientsQuery } = api.client.getClients.useQuery();

    if (!clientsQuery) return null;
    const { error } = clientsQuery;
    if (error) return null;
    const { data: clients } = clientsQuery;

    return (
        <div className="container mx-auto space-y-6 px-0 py-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Clients</h1>

                <Button asChild>
                    <Link to="/clients/new">Add Client</Link>
                </Button>
            </div>

            {clients.length === 0 ? (
                <div className="bg-muted/10 rounded-lg border p-12 text-center">
                    <h3 className="mb-2 text-lg font-medium">No Clients Yet</h3>

                    <p className="text-muted-foreground mb-6">
                        Add your first client to get started
                    </p>

                    <Button asChild>
                        <Link to="/clients/new">Add Client</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {clients.map((client) => (
                        <div
                            key={client.id}
                            className="bg-card flex items-center justify-between rounded-lg border p-4"
                        >
                            <Link
                                to="/clients/$clientId/sessions"
                                params={{ clientId: client.id }}
                                className="hover:text-primary flex items-center space-x-4 transition-colors"
                            >
                                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                                    <User className="text-primary h-5 w-5" />
                                </div>

                                <div>
                                    <div className="font-medium">
                                        {client.firstName} {client.lastName}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        {client.isActive
                                            ? 'Active'
                                            : 'Inactive'}
                                    </div>
                                </div>
                            </Link>

                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        to="/clients/$clientId/edit"
                                        params={{ clientId: client.id }}
                                    >
                                        <Pencil className="mr-1 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>

                                <Button
                                    id={client.id}
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                >
                                    <Link
                                        to="/clients/$clientId/sessions"
                                        params={{ clientId: client.id }}
                                    >
                                        View Sessions
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
