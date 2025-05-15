import { useEffect, useState } from 'react';

import { Link, useNavigate } from '@tanstack/react-router';

import { format } from 'date-fns';

import { PlusCircle, Calendar, Clock } from 'lucide-react';

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

const addSessionButtonId: TourStepId = 'add-session-button';
const ITEMS_PER_PAGE = 10;

export const ClientSessionsView = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);

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

    // Pagination logic
    const totalPages = Math.ceil(clientSessions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentSessions = clientSessions.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPaginationLinks = () => {
        const links = [];
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

    return (
        <ViewContainer>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    {clientName}&apos;s Sessions
                </h1>

                <Link
                    id={addSessionButtonId}
                    to="/clients/$clientId/sessions/new"
                    params={{ clientId }}
                >
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Session
                    </Button>
                </Link>
            </div>

            {clientSessions.length === 0 ? (
                <div className="bg-muted/10 rounded-lg border p-12 text-center">
                    <h3 className="mb-2 text-lg font-medium">
                        No Sessions Yet
                    </h3>

                    <p className="text-muted-foreground mb-6">
                        Create your first session to get started
                    </p>

                    <Link
                        to="/clients/$clientId/sessions/new"
                        params={{ clientId }}
                    >
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Session
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid gap-4">
                        {currentSessions.map((session) => (
                            <div
                                key={session.id}
                                className="bg-card flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="space-y-1">
                                    <div className="font-medium">
                                        <Calendar className="mr-2 inline-block h-4 w-4" />
                                        {format(
                                            new Date(session.sessionDate),
                                            'MMMM d, yyyy',
                                        )}
                                    </div>

                                    <div className="text-muted-foreground text-sm">
                                        <Clock className="mr-2 inline-block h-3 w-3" />
                                        {session.startTime} - {session.endTime}
                                    </div>

                                    <div className="text-muted-foreground text-sm">
                                        Location: {session.location}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to="/clients/$clientId/sessions/$sessionId"
                                        params={{
                                            clientId,
                                            sessionId: session.id,
                                        }}
                                    >
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

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
                                            if (currentPage < totalPages) {
                                                handlePageChange(
                                                    currentPage + 1,
                                                );
                                            }
                                        }}
                                        className={
                                            currentPage === totalPages
                                                ? 'pointer-events-none opacity-50'
                                                : ''
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}
        </ViewContainer>
    );
};
