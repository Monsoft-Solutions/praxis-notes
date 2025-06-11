import { db } from '@db/providers/server';

import { eq } from 'drizzle-orm';

import { fileTable } from '@src/fs/db';

import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { File } from '@shared/schemas';

import { getAzureBlobContent } from './get-azure-blob-content.provider';

import { strSha256 } from '@shared/utils/str-sha-256.util';

export const getFileById = (async ({ id }: { id: string }) => {
    const { data: fileRecord, error: fileRecordError } = await catchError(
        db.query.fileTable.findFirst({
            where: eq(fileTable.id, id),
        }),
    );

    if (fileRecordError) return Error();

    if (!fileRecord) return Error('FILE_RECORD_NOT_FOUND');

    const blobName = fileRecord.id;

    const { data: fileContent, error: fileContentError } =
        await getAzureBlobContent({ blobName });

    if (fileContentError) return Error();

    const { name, type } = fileRecord;

    const contentHash = strSha256(fileContent);

    if (contentHash !== fileRecord.hash) return Error('CORRUPTED_FILE');

    const file: File = {
        name,
        type,
        base64: fileContent,
    };

    return Success(file);
}) satisfies Function<{ id: string }, File>;
