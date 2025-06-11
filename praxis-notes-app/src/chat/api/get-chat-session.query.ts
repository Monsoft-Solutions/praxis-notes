import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { getChatSession as getChatSessionProvider } from '../provider';

export const getChatSession = protectedEndpoint
    .input(
        z.object({
            sessionId: z.string(),
        }),
    )
    .query(
        queryMutationCallback(async ({ input: { sessionId } }) => {
            // get the session
            const { data: chatSession, error: chatSessionError } =
                await getChatSessionProvider({ sessionId });

            if (chatSessionError) return Error();

            return Success(chatSession);
        }),
    );
