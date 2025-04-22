import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

export const getTeachingProcedures = protectedEndpoint.query(
    queryMutationCallback(async () => {
        const { data: teachingProcedureRecords, error } = await catchError(
            db.query.teachingProcedureTable.findMany({}),
        );

        if (error) return Error();

        const teachingProcedures = teachingProcedureRecords.map((record) => ({
            id: record.id,
            name: record.name,
        }));

        // return the templates matching the search query
        return Success(teachingProcedures);
    }),
);
