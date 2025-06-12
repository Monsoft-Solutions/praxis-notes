import { db } from '@db/providers/server';

import { fileTable } from '@src/fs/db';

import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { v4 as uuidv4 } from 'uuid';

import { strSha256 } from '@shared/utils/str-sha-256.util';

import { createAzureBlob } from './create-azure-blob.provider';

import { File } from '@shared/schemas';

export const createFile = (async ({ name, type, base64 }: File) => {
    const id = uuidv4();

    const hash = strSha256(base64);

    const { error: createBlobError } = await createAzureBlob({
        blobName: id,
        content: base64,
    });

    if (createBlobError) return Error();

    const { error: fileRecordError } = await catchError(
        db.insert(fileTable).values({
            id,
            type,
            name,
            hash,
        }),
    );

    if (fileRecordError) return Error();

    return Success({ id });
}) satisfies Function<File, { id: string }>;
