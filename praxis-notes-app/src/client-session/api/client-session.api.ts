import { endpoints } from '@api/providers/server';

// queries
import { getClientSessions } from './get-client-sessions.query';
import { getClientSession } from './get-client-session.query';

// mutations
import { createClientSession } from './create-client-session.mutation';
// subscriptions

export const clientSession = endpoints({
    // queries
    getClientSessions,
    getClientSession,
    // mutations
    createClientSession,

    // subscriptions
});
