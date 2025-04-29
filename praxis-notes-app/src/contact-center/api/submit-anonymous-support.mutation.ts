import { Error, Success } from '@errors/utils';

import { publicEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { v4 as uuidv4 } from 'uuid';

import { supportMessageTable } from '../db';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

// mutation to submit an anonymous support message
export const submitAnonymousSupport = publicEndpoint
    .input(
        z.object({
            name: z.string().optional(),
            phone: z.string(),
            message: z.string(),
        }),
    )
    .mutation(
        queryMutationCallback(async ({ input: { name, phone, message } }) => {
            // generate a unique id for the support message
            const id = uuidv4();

            // get current timestamp
            const createdAt = Date.now();

            // create the support message object
            const supportMessage = {
                id,
                userId: null, // anonymous message
                name,
                phone,
                message,
                createdAt,
            };

            // insert the support message into db
            const { error } = await catchError(
                db.insert(supportMessageTable).values(supportMessage),
            );

            // if insertion failed, return the error
            if (error) {
                return Error();
            }

            return Success();
        }),
    );
