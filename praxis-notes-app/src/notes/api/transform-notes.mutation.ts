import { Success, Error } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { transformNotesProvider } from '../providers/server/transform-notes.provider';
import { logger } from '@logger/providers';
import { transformNoteTypeSchema } from '../schema';

// mutation to transform notes based on the specified transformation type
export const transformNotes = protectedEndpoint
    .input(
        z.object({
            notes: z.string(),
            transformationType: transformNoteTypeSchema,
            customInstructions: z.string().optional(),
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
                const { notes, transformationType, customInstructions } = input;
                const { id } = user;

                try {
                    // Call the transformation service using the AI provider
                    const transformedNotes = await transformNotesProvider({
                        notes,
                        userId: id,
                        transformationType,
                        customInstructions,
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
