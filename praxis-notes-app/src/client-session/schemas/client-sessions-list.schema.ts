import { z } from 'zod';

/**
 * Schema for client session data returned by the getClientSessions query
 */
export const clientSessionListEntrySchema = z.object({
    id: z.string(),
    sessionDate: z.coerce.date(),
    startTime: z.string(),
    endTime: z.string(),
    location: z.string(),
    draft: z.boolean(),
});

export type ClientSessionListEntry = z.infer<
    typeof clientSessionListEntrySchema
>;

/**
 * Schema for the array of client sessions returned by the getClientSessions query
 */
export const clientSessionsListSchema = z.array(clientSessionListEntrySchema);

export type ClientSessionsList = z.infer<typeof clientSessionsListSchema>;
