import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { v4 as uuidv4 } from 'uuid';

import { supportMessageTable } from '../db';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { logger } from '@logger/providers/logger.provider';

// mutation to submit a support message
export const submitSupportMessage = protectedEndpoint
    .input(
        z.object({
            message: z.string(),
        }),
    )
    .mutation(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user },
                },
                input: { message },
            }) => {
                // generate a unique id for the support message
                const id = uuidv4();

                // get current timestamp
                const createdAt = Date.now();

                // create the support message object
                const supportMessage = {
                    id,
                    userId: user.id,
                    message,
                    createdAt,
                };

                logger.info('submitSupportMessage', {
                    id,
                    userId: user.id,
                    message,
                    createdAt,
                    infoType: 'Support Message',
                });

                // insert the support message into db
                const { error } = await catchError(
                    db.insert(supportMessageTable).values(supportMessage),
                );

                // if insertion failed, return the error
                if (error) {
                    return Error();
                }

                return Success();
            },
        ),
    );
