import { useEffect, useState, ChangeEvent } from 'react';

import { Link, useNavigate } from '@tanstack/react-router';

import { format } from 'date-fns';

import {
    PlusCircle,
    Calendar,
    Clock,
    MapPin,
    ChevronRight,
    Search,
} from 'lucide-react';

import { Button } from '@ui/button.ui';

import { Route } from '@routes/_private/_app/clients/$clientId/sessions';

import { api } from '@api/providers/web';

import { TourStepId } from '@shared/types/tour-step-id.type';
import { ViewContainer } from '@shared/ui';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@shared/ui/pagination.ui';
import { Input } from '@shared/ui/input.ui';
import { Badge } from '@shared/ui/badge.ui';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs.ui';

const addSessionButtonId: TourStepId = 'add-session-button';
const ITEMS_PER_PAGE = 10;

export const ClientSessionsView = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewType, setViewType] = useState('all');

    const { loggedInUser } = Route.useRouteContext();

    const clientName = loggedInUser.name;

    const { clientId } = Route.useParams();

    const { data: clientSessionsQuery } =
        api.clientSession.getClientSessions.useQuery({
            clientId,
        });

    useEffect(() => {
        const handler = () => {
            void navigate({
                to: '/clients/$clientId/sessions/new',
                params: { clientId },
            });
        };

        window.addEventListener('navigateToAddSession', handler);

        return () => {
            window.removeEventListener('navigateToAddSession', handler);
        };
    }, [clientId, navigate]);

    if (!clientSessionsQuery) return null;
    const { error } = clientSessionsQuery;
    if (error) return null;
    const { data: clientSessions } = clientSessionsQuery;

    // Filter sessions based on search query and view type
    const filteredSessions = clientSessions.filter((session) => {
        const matchesSearch =
            searchQuery === '' ||
            session.location
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            format(new Date(session.sessionDate), 'MMMM d, yyyy')
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        if (viewType === 'completed') {
            return matchesSearch && !session.draft;
        } else if (viewType === 'draft') {
            return matchesSearch && session.draft;
        }

        return matchesSearch;
    });

    // Sort sessions by date (most recent first)
    const sortedSessions = [...filteredSessions].sort(
        (a, b) =>
            new Date(b.sessionDate).getTime() -
            new Date(a.sessionDate).getTime(),
    );

    // Pagination logic
    const totalPages = Math.ceil(sortedSessions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentSessions = sortedSessions.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPaginationLinks = () => {
        const links = [] as React.JSX.Element[];
        const maxVisiblePages = 5;

        // Logic to determine which page numbers to show
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxVisiblePages / 2),
        );
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust startPage if we're near the end
        startPage = Math.max(1, endPage - maxVisiblePages + 1);

        for (let i = startPage; i <= endPage; i++) {
            links.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={currentPage === i}
                        onClick={() => {
                            handlePageChange(i);
                        }}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>,
            );
        }
        return links;
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="relative h-full min-h-0 overflow-hidden bg-gradient-to-br from-blue-50 via-blue-50 to-green-50">
            {/* Very subtle background decorations */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="hand-drawn-decorative-circle rotate-decorative-right absolute left-10 top-20 hidden h-12 w-12 border-blue-200 sm:block"></div>
                <div className="hand-drawn-decorative-square absolute bottom-32 right-16 hidden h-8 w-8 border-green-200 sm:block"></div>
                <div className="absolute bottom-20 left-1/4 hidden h-2 w-2 rounded-full bg-orange-200 opacity-50 sm:block"></div>
            </div>

            <ViewContainer>
                <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden">
                    {/* Header section */}
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <h1 className="text-hand-drawn-title text-3xl">
                            {clientName}&apos;s Sessions
                        </h1>
                        <Button
                            asChild
                            className="hand-drawn-button text-foreground font-quicksand bg-blue-400 font-semibold hover:bg-blue-500"
                        >
                            <Link
                                id={addSessionButtonId}
                                to="/clients/$clientId/sessions/new"
                                params={{ clientId }}
                                className="self-start sm:self-auto"
                            >
                                <PlusCircle className="mr-2 h-5 w-5" />
                                New Session
                            </Link>
                        </Button>
                    </div>

                    {/* Scrollable content */}
                    <div className="min-h-0 flex-1 overflow-auto">
                        {clientSessions.length === 0 ? (
                            <div className="hand-drawn-card border-blue-200 text-center">
                                <div className="thumb-tack-round text-blue-400"></div>

                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-blue-200 bg-blue-100">
                                    <Calendar className="h-10 w-10 text-blue-500" />
                                </div>

                                <h3 className="font-quicksand mb-3 text-xl font-semibold">
                                    No Sessions Yet
                                </h3>

                                <p className="text-hand-drawn-body text-muted-foreground mx-auto mb-8 max-w-md">
                                    Create your first session to start tracking
                                    your client meetings. You can schedule
                                    upcoming sessions or record past ones.
                                </p>

                                <Button
                                    asChild
                                    size="lg"
                                    className="hand-drawn-button text-foreground font-quicksand bg-blue-400 font-semibold hover:bg-blue-500"
                                >
                                    <Link
                                        to="/clients/$clientId/sessions/new"
                                        params={{ clientId }}
                                    >
                                        <PlusCircle className="mr-2 h-5 w-5" />
                                        New Session
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Filters and search */}
                                <div className="hand-drawn-card border-blue-200 p-4">
                                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                        <Tabs
                                            defaultValue="all"
                                            value={viewType}
                                            onValueChange={setViewType}
                                            className="w-full sm:w-auto"
                                        >
                                            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                                                <TabsTrigger value="all">
                                                    All
                                                </TabsTrigger>
                                                <TabsTrigger value="completed">
                                                    Completed
                                                </TabsTrigger>
                                                <TabsTrigger value="draft">
                                                    Draft
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>

                                        <div className="relative w-full sm:w-64">
                                            <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                                            <Input
                                                type="search"
                                                placeholder="Search sessions..."
                                                className="w-full pl-8"
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sessions grid */}
                                {currentSessions.length > 0 ? (
                                    <div className="grid gap-4">
                                        {currentSessions.map((session) => {
                                            const sessionDate = new Date(
                                                session.sessionDate,
                                            );

                                            return (
                                                <Link
                                                    key={session.id}
                                                    to="/clients/$clientId/sessions/$sessionId"
                                                    params={{
                                                        clientId,
                                                        sessionId: session.id,
                                                    }}
                                                    className="group"
                                                >
                                                    <div className="hand-drawn-card hover-lift border-blue-200 p-4 transition-all">
                                                        <div className="thumb-tack-round text-blue-400"></div>

                                                        <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                                                            <div className="space-y-2 sm:space-y-3">
                                                                <div className="flex flex-row items-center justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
                                                                    <div className="font-quicksand flex items-center text-base font-semibold sm:text-lg">
                                                                        <Calendar className="mr-1 inline-block h-4 w-4 text-blue-500 sm:mr-2 sm:h-5 sm:w-5" />
                                                                        {format(
                                                                            sessionDate,
                                                                            'MMMM d, yyyy',
                                                                        )}
                                                                    </div>

                                                                    <Badge
                                                                        variant={
                                                                            session.draft
                                                                                ? 'secondary'
                                                                                : 'default'
                                                                        }
                                                                        className="text-xs"
                                                                    >
                                                                        {session.draft
                                                                            ? 'Draft'
                                                                            : 'Completed'}
                                                                    </Badge>
                                                                </div>

                                                                <div className="flex flex-row justify-between gap-2 sm:flex-row sm:gap-4">
                                                                    <div className="text-muted-foreground flex items-center text-xs sm:text-sm">
                                                                        <Clock className="mr-1 inline-block h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                                                        {
                                                                            session.startTime
                                                                        }{' '}
                                                                        -{' '}
                                                                        {
                                                                            session.endTime
                                                                        }
                                                                    </div>

                                                                    <div className="text-muted-foreground flex items-center text-xs sm:text-sm">
                                                                        <MapPin className="mr-1 inline-block h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                                                        {
                                                                            session.location
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center sm:static sm:mt-0 sm:translate-y-0">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="ml-auto h-8 w-8 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 sm:h-10 sm:w-10"
                                                                >
                                                                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="hand-drawn-card border-blue-200 p-8 text-center">
                                        <div className="thumb-tack-round text-blue-400"></div>
                                        <p className="text-hand-drawn-body text-muted-foreground">
                                            No sessions match your search
                                            criteria.
                                        </p>
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Pagination className="mt-6">
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => {
                                                        if (currentPage > 1) {
                                                            handlePageChange(
                                                                currentPage - 1,
                                                            );
                                                        }
                                                    }}
                                                    className={
                                                        currentPage === 1
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }
                                                />
                                            </PaginationItem>

                                            {renderPaginationLinks()}

                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => {
                                                        if (
                                                            currentPage <
                                                            totalPages
                                                        ) {
                                                            handlePageChange(
                                                                currentPage + 1,
                                                            );
                                                        }
                                                    }}
                                                    className={
                                                        currentPage ===
                                                        totalPages
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </ViewContainer>
        </div>
    );
};
