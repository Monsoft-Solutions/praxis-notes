import { z } from 'zod';

export const chatMessageAuthorEnum = z.enum(['user', 'assistant']);

export type ChatMessageAuthor = z.infer<typeof chatMessageAuthorEnum>;
