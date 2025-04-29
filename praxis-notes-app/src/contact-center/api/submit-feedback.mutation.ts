import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { v4 as uuidv4 } from 'uuid';

import { feedbackTable } from '../db';
import { FeedbackType } from '../enums';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

// mutation to submit user feedback
export const submitFeedback = protectedEndpoint
    .input(
        z.object({
            type: z.string(),
            text: z.string(),
        }),
    )
    .mutation(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user },
                },
                input: { type, text },
            }) => {
                // generate a unique id for the feedback
                const id = uuidv4();

                // get current timestamp
                const createdAt = Date.now();

                // create the feedback object
                const feedback = {
                    id,
                    userId: user.id,
                    type: type as FeedbackType,
                    text,
                    createdAt,
                };

                // insert the feedback into db
                const { error } = await catchError(
                    db.insert(feedbackTable).values(feedback),
                );

                // if insertion failed, return the error
                if (error) {
                    return Error();
                }

                return Success();
            },
        ),
    );
