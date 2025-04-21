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

import { Route } from '@routes/_private/_app/_admin/behaviors';

import { api } from '@api/providers/web';
import { BehaviorForm } from './behavior-form.component';

export function BehaviorsTable() {
    const navigate = Route.useNavigate();

    const { searchQuery = '' } = Route.useSearch();

    const [behaviorId, setBehaviorId] = useState<string | boolean>(false);
    const isFormOpen = behaviorId !== false;

    const { data: behaviorsQuery } = api.behavior.getBehaviors.useQuery();

    if (!behaviorsQuery) return null;
    const { error: behaviorsError } = behaviorsQuery;
    if (behaviorsError) return null;
    const { data: behaviors } = behaviorsQuery;

    const setSearchQuery = (searchQuery: string) => {
        void navigate({
            search: (prev) => ({
                ...prev,
                searchQuery: searchQuery === '' ? undefined : searchQuery,
            }),
        });
    };

    const filteredBehaviors = searchQuery
        ? behaviors.filter((behavior) =>
              behavior.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : behaviors;

    const behavior = behaviors.find((behavior) => behavior.id === behaviorId);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                    <CardTitle>Behaviors</CardTitle>

                    <div className="flex justify-between">
                        <Button
                            size="sm"
                            onClick={() => {
                                setBehaviorId(true);
                            }}
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Behavior
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Search input */}
                    <div className="relative mb-4 flex w-full max-w-md items-center">
                        <Search className="text-muted-foreground absolute left-2 h-4 w-4" />

                        <Input
                            type="search"
                            placeholder="Search behaviors..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                            }}
                        />
                    </div>

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
                                {filteredBehaviors.map((behavior) => (
                                    <TableRow key={behavior.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                {behavior.name}

                                                <div className="mt-1 md:hidden">
                                                    <Badge
                                                        variant="outline"
                                                        className="mr-1 text-xs"
                                                    ></Badge>

                                                    {behavior.isCustom ? (
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
                                                    {behavior.description ??
                                                        'No description'}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="hidden sm:table-cell">
                                            {/* <Badge variant="outline"></Badge> */}
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell">
                                            {behavior.isCustom ? (
                                                <Badge>Organization</Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Global
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell className="hidden max-w-[300px] truncate lg:table-cell">
                                            {behavior.description ??
                                                'No description'}
                                        </TableCell>

                                        <TableCell>
                                            {behavior.isCustom && (
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
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setBehaviorId(
                                                                    behavior.id,
                                                                );
                                                            }}
                                                        >
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

                                {filteredBehaviors.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center"
                                        >
                                            No matching behaviors found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Behavior Form Dialog */}
            {isFormOpen && (
                <BehaviorForm
                    open={isFormOpen}
                    onOpenChange={setBehaviorId}
                    values={
                        behavior
                            ? {
                                  id: behavior.id,
                                  name: behavior.name,
                                  description: behavior.description ?? '',
                              }
                            : undefined
                    }
                />
            )}
        </div>
    );
}
