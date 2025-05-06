import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { emit } from '@events/providers';

import { clientSessionTable } from '../db';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { eq } from 'drizzle-orm';

// Define the schema for input similar to createClientSession
const updateClientSessionInput = z.object({
    sessionId: z.string(),
    sessionForm: z.object({
        sessionDate: z.string(), // String format from frontend
        startTime: z.string(),
        endTime: z.string(),
        location: z.string(),
        valuation: z.enum(['good', 'fair', 'poor']),
        observations: z.string().nullable(),
        environmentalChanges: z.array(z.string()),
        replacementProgramEntries: z.array(
            z.object({
                replacementProgramId: z.string(),
                teachingProcedureId: z.string().nullable(),
                promptingProcedureId: z.string().nullable(),
                clientResponse: z.string().nullable(),
                progress: z.string().nullable(),
                promptTypesIds: z.array(z.string()),
            }),
        ),
        presentParticipants: z.array(z.string()),
        abcIdEntries: z.array(
            z.object({
                function: z.enum(['atention', 'escape', 'sensory', 'tangible']),
                antecedentId: z.string(),
                behaviorIds: z.array(z.string()),
                interventionIds: z.array(z.string()),
            }),
        ),
    }),
});

// mutation to update an existing client session
export const updateClientSession = protectedEndpoint
    .input(updateClientSessionInput)
    .mutation(
        queryMutationCallback(async ({ input: { sessionId, sessionForm } }) => {
            // ensure user has permission to update a client session
            // ensurePermission({
            //     user,
            //     resource: 'clientSession',
            //     action: 'update',
            // });

            // current timestamp for updatedAt
            const now = Date.now();

            // Convert the session form data for database update
            // Need to handle the specific field mappings here
            // This is just a simplified example - implement according to actual DB schema
            const sessionUpdateData = {
                updatedAt: now,
                sessionDate: new Date(sessionForm.sessionDate).toISOString(), // Convert to timestamp
                startTime: sessionForm.startTime,
                endTime: sessionForm.endTime,
                location: sessionForm.location,
                valuation: sessionForm.valuation,
                observations: sessionForm.observations,
                // Other fields would need proper mapping based on DB schema
            };

            // update the client session in the database
            const { error } = await catchError(
                db
                    .update(clientSessionTable)
                    .set(sessionUpdateData)
                    .where(eq(clientSessionTable.id, sessionId)),
            );

            // if update failed, return the error
            if (error) return Error();

            // emit a client-session-updated event
            emit({
                event: 'sessionNotesUpdated', // Use an existing valid event type
                payload: {
                    sessionId,
                    notes: '', // Empty string as we're not updating notes here
                    isComplete: true,
                },
            });

            return Success({ id: sessionId }); // Return same structure as createClientSession
        }),
    );
