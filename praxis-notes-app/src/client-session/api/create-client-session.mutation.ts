import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { v4 as uuidv4 } from 'uuid';

import {
    clientSessionTable,
    clientSessionParticipantTable,
    clientSessionEnvironmentalChangeTable,
    clientSessionAbcEntryTable,
} from '../db';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { clientSessionValuationEnum } from '../enum';

import { generateNotes as generateNotesProvider } from '@src/notes/providers/server';

// mutation to create a client session
export const createClientSession = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),

            initNotes: z.boolean(),

            sessionForm: z.object({
                location: z.string(),
                sessionDate: z.string(),
                startTime: z.string(),
                endTime: z.string(),

                valuation: clientSessionValuationEnum,
                observations: z.string(),

                presentParticipants: z.array(z.string()),
                environmentalChanges: z.array(z.string()),

                abcEntries: z.array(
                    z.object({
                        antecedent: z.string(),
                        behavior: z.string(),
                        intervention: z.string(),
                    }),
                ),
            }),
        }),
    )
    .mutation(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user },
                },
                input: { clientId, initNotes, sessionForm },
            }) => {
                console.log(sessionForm);

                const {
                    sessionDate,
                    startTime,
                    endTime,
                    location,
                    valuation,
                    observations,

                    presentParticipants,
                    environmentalChanges,

                    abcEntries,
                } = sessionForm;

                // generate a unique id for the client session
                const id = uuidv4();

                const notes = initNotes
                    ? (
                          await generateNotesProvider({
                              ...sessionForm,
                              sessionDate: new Date(sessionForm.sessionDate),
                          })
                      ).data
                    : null;

                // create the client session object
                const clientSession = {
                    id,

                    userId: user.id,
                    clientId,

                    location,
                    sessionDate,
                    startTime,
                    endTime,

                    valuation,
                    observations,

                    notes,
                };

                // insert the client session into db
                const { error } = await catchError(
                    db.insert(clientSessionTable).values(clientSession),
                );

                // if insertion failed, return the error
                if (error) {
                    if (error === 'DUPLICATE_ENTRY') return Error('DUPLICATE');

                    return Error();
                }
                // otherwise...

                for (const participant of presentParticipants) {
                    const { error } = await catchError(
                        db.insert(clientSessionParticipantTable).values({
                            id: uuidv4(),
                            clientSessionId: id,
                            name: participant,
                        }),
                    );

                    if (error) return Error();
                }

                for (const change of environmentalChanges) {
                    const { error } = await catchError(
                        db
                            .insert(clientSessionEnvironmentalChangeTable)
                            .values({
                                id: uuidv4(),
                                clientSessionId: id,
                                name: change,
                            }),
                    );

                    if (error) return Error();
                }

                for (const abcEntry of abcEntries) {
                    await db
                        .insert(clientSessionAbcEntryTable)
                        .values({
                            id: uuidv4(),
                            clientSessionId: id,
                            antecedentId: abcEntry.antecedent,
                            behaviorId: abcEntry.behavior,
                            interventionId: abcEntry.intervention,
                        })
                        .catch((error: unknown) => {
                            console.log('-->   ~ error:', error);
                        });
                }

                return Success({ id });
            },
        ),
    );
