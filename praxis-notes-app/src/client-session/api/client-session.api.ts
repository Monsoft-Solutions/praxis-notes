import { endpoints } from '@api/providers/server';

// queries
import { getClientSessions } from './get-client-sessions.query';
import { getClientSession } from './get-client-session.query';
import { getPlaceholderSessionData } from './get-placeholder-session-data.query';
// mutations
import { createClientSession } from './create-client-session.mutation';
import { updateClientSession } from './update-client-session.mutation';
// subscriptions

export const clientSession = endpoints({
    // queries
    getClientSessions,
    getClientSession,
    getPlaceholderSessionData,
    // mutations
    createClientSession,
    updateClientSession,

    // subscriptions
});
