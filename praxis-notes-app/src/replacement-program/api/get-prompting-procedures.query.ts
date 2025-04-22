import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

export const getPromptingProcedures = protectedEndpoint.query(
    queryMutationCallback(async () => {
        const { data: promptingProcedureRecords, error } = await catchError(
            db.query.promptingProcedureTable.findMany({}),
        );

        if (error) return Error();

        const promptingProcedures = promptingProcedureRecords.map((record) => ({
            id: record.id,
            name: record.name,
        }));

        // return the templates matching the search query
        return Success(promptingProcedures);
    }),
);
