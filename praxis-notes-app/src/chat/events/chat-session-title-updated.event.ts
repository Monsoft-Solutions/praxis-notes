import { z } from 'zod';

export const chatSessionTitleUpdated = z.object({
    id: z.string(),
    title: z.string(),
});

// chat-session-title-updated event type
export type ChatSessionTitleUpdatedEvent = z.infer<
    typeof chatSessionTitleUpdated
>;
