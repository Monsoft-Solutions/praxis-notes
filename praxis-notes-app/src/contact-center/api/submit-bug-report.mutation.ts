import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { v4 as uuidv4 } from 'uuid';

import { bugReportTable } from '../db';
import { appAreaEnum, bugSeverityEnum } from '../enums';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { logger } from '@logger/providers/logger.provider';

// mutation to submit a bug report
export const submitBugReport = protectedEndpoint
    .input(
        z.object({
            title: z.string(),
            description: z.string(),
            stepsToReproduce: z.string().optional(),
            area: appAreaEnum.optional(),
            severity: bugSeverityEnum.optional(),
        }),
    )
    .mutation(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user },
                },
                input,
            }) => {
                const { title, description, stepsToReproduce, area, severity } =
                    input;

                logger.info('submitBugReport', {
                    title,
                    description,
                    stepsToReproduce,
                    area,
                    severity,
                    infoType: 'Bug Report',
                });

                // generate a unique id for the bug report
                const id = uuidv4();

                // get current timestamp
                const createdAt = Date.now();

                // create the bug report object
                const bugReport = {
                    id,
                    userId: user.id,
                    title,
                    description,
                    stepsToReproduce,
                    area: area,
                    severity: severity,
                    createdAt,
                };

                // insert the bug report into db
                const { error } = await catchError(
                    db.insert(bugReportTable).values(bugReport),
                );

                // if insertion failed, return the error
                if (error) {
                    return Error();
                }

                return Success();
            },
        ),
    );
