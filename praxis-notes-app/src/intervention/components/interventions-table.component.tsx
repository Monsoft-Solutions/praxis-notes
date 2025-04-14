import { useState } from 'react';

import { PlusIcon, Search, MoreHorizontal } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@ui/table.ui';

import { Button } from '@ui/button.ui';

import { Badge } from '@ui/badge.ui';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@ui/dropdown-menu.ui';

import { Input } from '@ui/input.ui';

import { Route } from '@routes/_private/_app/_admin/interventions';

import { api } from '@api/providers/web';
import { InterventionForm } from './interventions-form.component';

export function InterventionsTable() {
    const navigate = Route.useNavigate();

    const { searchQuery } = Route.useSearch();

    const [isAddOpen, setIsAddOpen] = useState(false);

    const { data: interventionsQuery } =
        api.intervention.getInterventions.useQuery();

    if (!interventionsQuery) return null;
    const { error: interventionsError } = interventionsQuery;
    if (interventionsError) return null;
    const { data: interventions } = interventionsQuery;

    const setSearchQuery = (searchQuery: string) => {
        void navigate({
            search: (prev) => ({ ...prev, searchQuery, page: 1 }),
        });
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                    <CardTitle>Interventions</CardTitle>

                    <div className="flex justify-between">
                        <Button
                            size="sm"
                            onClick={() => {
                                setIsAddOpen(true);
                            }}
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Intervention
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Search input */}
                    <form className="mb-4 flex w-full max-w-md items-center space-x-2">
                        <div className="relative flex-1">
                            <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                            <Input
                                type="search"
                                placeholder="Search interventions..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                }}
                            />
                        </div>
                    </form>

                    <div className="-mx-4 overflow-x-auto sm:mx-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>

                                    <TableHead className="hidden sm:table-cell">
                                        Category
                                    </TableHead>

                                    <TableHead className="hidden md:table-cell">
                                        Scope
                                    </TableHead>

                                    <TableHead className="hidden lg:table-cell">
                                        Description
                                    </TableHead>

                                    <TableHead className="w-[80px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {interventions.map((intervention) => (
                                    <TableRow key={intervention.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                {intervention.name}
                                                <div className="mt-1 md:hidden">
                                                    {/* <Badge
                                                        variant="outline"
                                                        className="mr-1 text-xs"
                                                    >
                                                        {intervention.category ??
                                                            'Uncategorized'}
                                                    </Badge> */}
                                                    <span className="sr-only">
                                                        Scope:
                                                    </span>
                                                    {intervention.organizationId ? (
                                                        <Badge className="text-xs">
                                                            Org
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            Global
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-muted-foreground mt-1 max-w-[200px] truncate text-xs lg:hidden">
                                                    {intervention.description ??
                                                        'No description'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {/* <Badge variant="outline">
                                                {intervention.category ??
                                                    'Uncategorized'}
                                            </Badge> */}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {intervention.organizationId ? (
                                                <Badge>Organization</Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Global
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden max-w-[300px] truncate lg:table-cell">
                                            {intervention.description ??
                                                'No description'}
                                        </TableCell>
                                        <TableCell>
                                            {intervention.organizationId && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <span className="sr-only">
                                                                Open menu
                                                            </span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            Edit
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem className="text-destructive">
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {interventions.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center"
                                        >
                                            No interventions found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Intervention Form Dialog */}
            <InterventionForm
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                // onSuccess={onFormSuccess}
            />
        </div>
    );
}
