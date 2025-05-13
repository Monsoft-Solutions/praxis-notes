import { Success, Error } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { eq } from 'drizzle-orm';
import { clientSessionTable } from '@db/db.tables';
import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';
import { translateNotesProvider } from '../providers/server';

// mutation to generate notes
export const updateNotes = protectedEndpoint
    .input(
        z.object({
            sessionId: z.string(),
            notes: z.string(),
            translateToEnglish: z.boolean().default(false),
        }),
    )
    .mutation(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user },
                },
                input: { sessionId, notes, translateToEnglish },
            }) => {
                let notesToSave = notes;

                if (translateToEnglish) {
                    const { data: translatedNotes } =
                        await translateNotesProvider({
                            notes,
                            userId: user.id,
                            baseLanguage: 'Spanish',
                            targetLanguage: 'English',
                        });

                    if (translatedNotes) {
                        notesToSave = translatedNotes;
                    } else {
                        return Error('TRANSLATION_FAILED');
                    }
                }

                const { error } = await catchError(
                    db
                        .update(clientSessionTable)
                        .set({ notes: notesToSave })
                        .where(eq(clientSessionTable.id, sessionId)),
                );

                if (error) return Error();

                return Success();
            },
        ),
    );
