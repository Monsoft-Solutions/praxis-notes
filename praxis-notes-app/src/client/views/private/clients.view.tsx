import { Link } from '@tanstack/react-router';

import { Button } from '@ui/button.ui';

import { User } from 'lucide-react';

import { api } from '@api/providers/web';

type Client = {
    id: string;
    firstName: string;
    lastName: string;
};

export const ClientsView = () => {
    const { data: clientsQuery } = api.client.getClients.useQuery();

    if (!clientsQuery) return null;
    const { error } = clientsQuery;
    if (error) return null;
    const { data: clients } = clientsQuery;

    return (
        <div className="container mx-auto space-y-6 py-6">
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
                    {clients.map((client: Client) => (
                        <Link
                            key={client.id}
                            to="/clients/$clientId/sessions"
                            params={{ clientId: client.id }}
                            className="bg-card hover:bg-accent/10 flex items-center justify-between rounded-lg border p-4 transition-colors"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                                    <User className="text-primary h-5 w-5" />
                                </div>

                                <div>
                                    <div className="font-medium">
                                        {client.firstName} {client.lastName}
                                    </div>
                                </div>
                            </div>

                            <Button variant="ghost">View Sessions</Button>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
