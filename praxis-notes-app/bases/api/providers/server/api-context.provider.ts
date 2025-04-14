import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';

import { authHeaderKey } from '@api/constants';

import { authHeaderToSessionId } from '@api/utils';

// Server context created on every API request
export const apiContext = ({ req: { headers } }: CreateHTTPContextOptions) => {
    const authHeader = headers[authHeaderKey];

    if (!authHeader) return { session: null };

    const { data: sessionId, error } = authHeaderToSessionId({ authHeader });

    if (error) return { session: null };

    const session = { id: sessionId };

    return { session };
};
