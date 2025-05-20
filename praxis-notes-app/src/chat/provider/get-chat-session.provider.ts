import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';

import { eq, asc } from 'drizzle-orm';

import { chatSessionTable, chatMessageTable } from '../db';

import { getFileById } from '@src/fs/providers/servers/get-file-by-id.provider';

import { ChatSession } from '../schemas';

// Default system message used for new chat sessions
export const getChatSession = (async ({ sessionId }: { sessionId: string }) => {
    const { data: rawChatSession, error: rawChatSessionError } =
        await catchError(
            db.query.chatSessionTable.findFirst({
                where: eq(chatSessionTable.id, sessionId),
                with: {
                    messages: {
                        orderBy: asc(chatMessageTable.createdAt),

                        with: {
                            attachments: true,
                        },
                    },
                },
            }),
        );

    if (rawChatSessionError) return Error();

    if (!rawChatSession) return Error();

    const { messages: rawMessages } = rawChatSession;

    const messages = await Promise.all(
        rawMessages.map(async ({ attachments: rawAttachments, ...message }) => {
            const attachments = (
                await Promise.all(
                    rawAttachments.map(async (attachment) => {
                        const { data: file, error: fileError } =
                            await getFileById({
                                id: attachment.id,
                            });

                        if (fileError) return null;

                        return file;
                    }),
                )
            ).filter((item) => item !== null);

            return {
                ...message,
                attachments,
            };
        }),
    );

    const chatSession: ChatSession = {
        ...rawChatSession,
        messages,
    };

    return Success(chatSession);
}) satisfies Function<
    {
        sessionId: string;
    },
    ChatSession
>;
