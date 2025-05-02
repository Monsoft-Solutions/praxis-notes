import { z } from 'zod';

// session-notes-updated event schema
export const sessionNotesUpdated = z.object({
    sessionId: z.string(),
    notes: z.string(),
    isComplete: z.boolean(),
});

// session-notes-updated event type
export type SessionNotesUpdatedEvent = z.infer<typeof sessionNotesUpdated>;
