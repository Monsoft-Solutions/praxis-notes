import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { count, eq } from 'drizzle-orm';

import { db } from '@db/providers/server';

import { userTable } from '@auth/db';

import { templateTable } from '@app/db';
import { TemplatesStats } from '@src/template/schemas';
import { catchError } from '@errors/utils/catch-error.util';

// get the templates stats
export const getTemplatesStats = (async () => {
    // get the number of draft templates
    const { data: draftTemplatesQueryData, error: draftTemplatesQueryError } =
        await catchError(
            db
                .select({ count: count() })
                .from(templateTable)
                .where(eq(templateTable.status, 'draft')),
        );

    if (draftTemplatesQueryError) return Error('DRAFT_TEMPLATES_QUERY');

    const numDraftTemplates = draftTemplatesQueryData.at(0)?.count ?? 0;

    // get the number of finished templates
    const {
        data: finishedTemplatesQueryData,
        error: finishedTemplatesQueryError,
    } = await catchError(
        db
            .select({ count: count() })
            .from(templateTable)
            .where(eq(templateTable.status, 'finished')),
    );

    if (finishedTemplatesQueryError) return Error('Finished_TEMPLATES_QUERY');

    const numFinishedTemplates = finishedTemplatesQueryData.at(0)?.count ?? 0;

    // get the number of templates per user
    const {
        data: templatesPerUserQueryData,
        error: templatesPerUserQueryError,
    } = await catchError(
        db
            .select({
                userId: userTable.id,
                templatesCount: count(templateTable.id),
            })
            .from(userTable)
            .leftJoin(templateTable, eq(userTable.id, templateTable.creator))
            .groupBy(userTable.id),
    );

    if (templatesPerUserQueryError) return Error('TEMPLATES_PER_USER_QUERY');

    // get the number of creators
    // (users who have at least one template)
    const numCreators = templatesPerUserQueryData.filter(
        (user) => user.templatesCount > 0,
    ).length;

    const templateStats = {
        numDraftTemplates,
        numFinishedTemplates,
        numCreators,
    };

    // return the templates stats
    return Success(templateStats);
}) satisfies Function<void, TemplatesStats>;
