import { Success, Error } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { transformNotesProvider } from '../providers/server/transform-notes.provider';
import { logger } from '@logger/providers';
import { transformNoteTypeSchema } from '../schema';
import { getClientSessionData } from '../providers/server';

// mutation to transform notes based on the specified transformation type
export const transformNotes = protectedEndpoint
    .input(
        z.object({
            notes: z.string(),
            transformationType: transformNoteTypeSchema,
            customInstructions: z.string().optional(),
            sessionId: z.string(),
        }),
    )
    .mutation(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user },
                },
                input,
            }) => {
                const {
                    notes,
                    transformationType,
                    customInstructions,
                    sessionId,
                } = input;
                const { id } = user;

                const { data: result, error: sessionDataError } =
                    await getClientSessionData(sessionId);

                if (sessionDataError) return Error('SESSION_DATA_ERROR');

                const { sessionData } = result;

                try {
                    // Call the transformation service using the AI provider
                    const transformedNotes = await transformNotesProvider({
                        notes,
                        userId: id,
                        transformationType,
                        customInstructions,
                        sessionData,
                    });

                    return Success({ notes: transformedNotes.data });
                } catch (err) {
                    logger.error('Failed to transform notes', {
                        err,
                        transformationType,
                    });
                    return Error('TRANSFORMATION_FAILED');
                }
            },
        ),
    );
