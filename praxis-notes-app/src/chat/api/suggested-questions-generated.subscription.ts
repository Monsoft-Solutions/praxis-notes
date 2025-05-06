import { protectedEndpoint, subscribe } from '@api/providers/server';

import { z } from 'zod';

// subscription to notify when a chat message is created
export const onSuggestedQuestionsGenerated = protectedEndpoint
    .input(
        z.object({
            sessionId: z.string(),
        }),
    )
    .subscription(
        subscribe(
            'suggestedQuestionsGenerated',

            ({ input: { sessionId }, data }) => {
                // only send events for the requested session
                if (data.sessionId !== sessionId) return;

                const { questions } = data;

                return questions;
            },
        ),
    );
