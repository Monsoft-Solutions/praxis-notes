import React from 'react';
import { User } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@ui/card.ui';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@ui/table.ui';
import { Button } from '@ui/button.ui';
import { api } from '@api/providers/web';

export const ClientsOverview: React.FC = () => {
    const { data: clientsQuery } = api.client.getClients.useQuery();

    if (!clientsQuery)
        return <div className="py-4 text-center">Loading clients data...</div>;

    const { error } = clientsQuery;
    if (error)
        return (
            <div className="py-4 text-center text-red-500">
                Error loading clients data
            </div>
        );

    const { data: clients } = clientsQuery;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Clients Overview</CardTitle>
                        <CardDescription>
                            List of all clients in your organization
                        </CardDescription>
                    </div>
                    <Button asChild size="sm">
                        <Link to="/clients/new">Add Client</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {clients.length === 0 ? (
                    <div className="bg-muted/10 rounded-lg border p-12 text-center">
                        <h3 className="mb-2 text-lg font-medium">
                            No Clients Yet
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Add your first client to get started
                        </p>
                        <Button asChild>
                            <Link to="/clients/new">Add Client</Link>
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                                                <User className="text-primary h-4 w-4" />
                                            </div>
                                            <div className="font-medium">
                                                {client.firstName}{' '}
                                                {client.lastName}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {client.isActive
                                            ? 'Active'
                                            : 'Inactive'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
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
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};
