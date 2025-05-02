import { z } from 'zod';

// session-notes-updated event schema
export const sessionNotesUpdated = z.object({
    sessionId: z.string(),
    notes: z.string(),
});

// session-notes-updated event type
export type SessionNotesUpdatedEvent = z.infer<typeof sessionNotesUpdated>;
