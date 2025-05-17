import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { generateNotes as generateNotesProvider } from '../providers/server/generate-notes.provider';
import { db } from '@db/providers/server';

import { eq } from 'drizzle-orm';

import { emit } from '@events/providers';

import { clientSessionTable } from '@src/client-session/db';
import { getClientSessionData } from '../providers/server/get-client-session-data.provider';

// mutation to generate notes
export const generateNotes = protectedEndpoint
    .input(z.object({ sessionId: z.string(), save: z.boolean().optional() }))
    .mutation(
        queryMutationCallback(async ({ input: { sessionId, save } }) => {
            const { data: result, error: sessionDataError } =
                await getClientSessionData(sessionId);

            if (sessionDataError) return Error('SESSION_DATA_ERROR');

            const { sessionData, clientData, userData } = result;

            let text = '';

            const { data: generatedNotes, error: generatedNotesError } =
                await generateNotesProvider({
                    sessionData,
                    clientData,
                    userBasicData: {
                        userId: userData.id,
                        firstName: userData.name,
                        lastName: userData.lastName,
                        language: userData.language ?? 'en',
                    },
                    model: 'claude-3-7-sonnet-latest',
                });

            if (generatedNotesError === 'INSUFFICIENT_CREDITS')
                return Error(generatedNotesError);

            if (generatedNotesError) return Error();

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            while (true) {
                const { done, value: textDelta } = await generatedNotes.read();

                if (!done) text += textDelta;

                emit({
                    event: 'sessionNotesUpdated',
                    payload: {
                        sessionId,
                        notes: text,
                        isComplete: done,
                    },
                });

                if (done) break;
            }

            if (save) {
                await db
                    .update(clientSessionTable)
                    .set({
                        notes: text,
                    })
                    .where(eq(clientSessionTable.id, sessionId));
            }

            if (save) {
                await db
                    .update(clientSessionTable)
                    .set({
                        notes: text,
                    })
                    .where(eq(clientSessionTable.id, sessionId));
            }

            return Success();
        }),
    );
