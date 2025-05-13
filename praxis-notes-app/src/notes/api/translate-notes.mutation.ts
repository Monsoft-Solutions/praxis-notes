import { Success, Error } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { translateNotesProvider } from '../providers/server/translate-notes.provider';
import { logger } from '@logger/providers';

// mutation to translate notes to Spanish
export const translateNotes = protectedEndpoint
    .input(z.object({ notes: z.string() }))
    .mutation(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user },
                },
                input,
            }) => {
                const { notes } = input;
                const { id } = user;

                try {
                    // Call the translation service using the AI provider
                    const translatedNotes = await translateNotesProvider({
                        notes,
                        userId: id,
                        baseLanguage: 'English',
                        targetLanguage: 'Spanish',
                    });

                    return Success({ notes: translatedNotes.data });
                } catch (err) {
                    logger.error('Failed to translate notes', { err });
                    return Error('TRANSLATION_FAILED');
                }
            },
        ),
    );
