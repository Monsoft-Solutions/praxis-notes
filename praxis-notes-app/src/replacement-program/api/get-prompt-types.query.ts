import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

export const getPromptTypes = protectedEndpoint.query(
    queryMutationCallback(async () => {
        const { data: promptTypeRecords, error } = await catchError(
            db.query.promptTypeTable.findMany({}),
        );

        if (error) return Error();

        const promptTypes = promptTypeRecords.map((record) => ({
            id: record.id,
            name: record.name,
        }));

        // return the templates matching the search query
        return Success(promptTypes);
    }),
);
