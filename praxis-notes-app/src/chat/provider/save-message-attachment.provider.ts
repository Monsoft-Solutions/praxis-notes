import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';

import { chatMessageAttachmentTable } from '../db';

import { File } from '@shared/schemas';
import { createFile } from '@src/fs/providers/servers';

import { v4 as uuidv4 } from 'uuid';

export const saveMessageAttachment = (async ({ messageId, file }) => {
    const { data: newFile, error: newFileError } = await createFile(file);

    if (newFileError) return Error();

    const { id: fileId } = newFile;

    const { error } = await catchError(
        db.insert(chatMessageAttachmentTable).values({
            id: uuidv4(),
            messageId,
            fileId,
        }),
    );

    if (error) return Error();

    return Success(fileId);
}) satisfies Function<{ messageId: string; file: File }, string>;
