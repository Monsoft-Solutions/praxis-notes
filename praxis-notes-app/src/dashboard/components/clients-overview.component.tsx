import React from 'react';
import { User, Plus, Eye } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import { CardTitle } from '@ui/card.ui';
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
import { BORDER_RADIUS } from '@shared/constants/design-tokens.constant';

export const ClientsOverview: React.FC = () => {
    const { data: clientsQuery } = api.client.getClients.useQuery();

    if (!clientsQuery)
        return (
            <div
                className="font-nunito py-4 text-center text-blue-600"
                role="status"
                aria-live="polite"
            >
                <span className="sr-only">Loading clients data...</span>
                Loading clients data...
            </div>
        );

    const { error } = clientsQuery;
    if (error)
        return (
            <div className="font-nunito py-4 text-center text-red-500">
                Error loading clients data
            </div>
        );

    const { data: clients } = clientsQuery;

    return (
        <div
            className="relative rounded-3xl border-2 border-blue-200 bg-white p-6 shadow-lg"
            style={{
                borderRadius: BORDER_RADIUS.panel.xl,
            }}
        >
            {/* Thumb tack */}
            <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 transform">
                <div className="h-full w-full rounded-full bg-blue-400 shadow-sm"></div>
                <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></div>
            </div>

            {/* Card header */}
            <div className="pb-6 pt-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="font-quicksand text-xl font-bold text-gray-800">
                        Clients Overview
                    </CardTitle>
                    <Button
                        asChild
                        size="sm"
                        className="font-quicksand h-9 rounded-xl bg-blue-400 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md"
                        style={{
                            borderRadius: BORDER_RADIUS.button.md,
                        }}
                    >
                        <Link to="/clients/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Client
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Card content */}
            <div>
                {clients.length === 0 ? (
                    <div
                        className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-12 text-center shadow-sm"
                        style={{
                            borderRadius: BORDER_RADIUS.panel.lg,
                            borderStyle: 'dashed',
                        }}
                    >
                        <div className="mb-4 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-200">
                                <User className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>
                        <h3 className="font-quicksand mb-2 text-lg font-semibold text-gray-800">
                            No Clients Yet
                        </h3>
                        <p className="font-nunito mb-6 text-gray-600">
                            Add your first client to get started with session
                            tracking
                        </p>
                        <Button
                            asChild
                            className="font-quicksand h-11 rounded-xl bg-blue-400 font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-md"
                            style={{
                                borderRadius: BORDER_RADIUS.button.primary,
                            }}
                        >
                            <Link to="/clients/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Client
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div
                        className="overflow-hidden rounded-2xl border border-blue-200 bg-white"
                        style={{
                            borderRadius: BORDER_RADIUS.panel.table,
                        }}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-blue-200 bg-blue-50">
                                    <TableHead className="font-quicksand font-semibold text-blue-800">
                                        Client
                                    </TableHead>
                                    <TableHead className="font-quicksand font-semibold text-blue-800">
                                        Status
                                    </TableHead>
                                    <TableHead className="font-quicksand text-right font-semibold text-blue-800">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.map((client, index) => (
                                    <TableRow
                                        key={client.id}
                                        className={`border-b border-blue-100 transition-colors hover:bg-blue-50 ${
                                            index % 2 === 0
                                                ? 'bg-white'
                                                : 'bg-blue-50'
                                        }`}
                                    >
                                        <TableCell className="py-4">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="flex h-10 w-10 items-center justify-center border-2 border-blue-200 bg-blue-100"
                                                    style={{
                                                        borderRadius:
                                                            BORDER_RADIUS.button
                                                                .tiny,
                                                    }}
                                                >
                                                    <User className="h-5 w-5 text-blue-500" />
                                                </div>
                                                <div className="font-nunito font-medium text-gray-800">
                                                    {client.firstName}{' '}
                                                    {client.lastName}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span
                                                className={`font-quicksand inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    client.isActive
                                                        ? 'border border-green-200 bg-green-100 text-green-700'
                                                        : 'border border-orange-200 bg-orange-100 text-orange-700'
                                                }`}
                                                style={{
                                                    borderRadius:
                                                        BORDER_RADIUS.badge
                                                            .pill,
                                                }}
                                            >
                                                {client.isActive
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="font-quicksand h-8 rounded-lg font-medium text-blue-600 transition-all hover:bg-blue-100 hover:shadow-sm"
                                                style={{
                                                    borderRadius:
                                                        BORDER_RADIUS.button.sm,
                                                }}
                                            >
                                                <Link
                                                    to="/clients/$clientId/sessions"
                                                    params={{
                                                        clientId: client.id,
                                                    }}
                                                >
                                                    <Eye className="mr-1 h-3 w-3" />
                                                    View Sessions
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
};
