import type { Resource } from '@guard/types';

type Data = {
    id: string;

    // id of the user who owns the chat session
    userId: string;
};

// actions that can be performed on a chat resource
type Action = 'create' | 'read' | 'update' | 'delete' | 'update_settings';

// chat resource access control matrix
// top level keys are roles
// second level keys are actions
export const chat: Resource<Data, Action> = {
    chat_user: {
        create: true,
        read: ({ user, instance }) => user.id === instance.userId,
        update: ({ user, instance }) => user.id === instance.userId,
        delete: ({ user, instance }) => user.id === instance.userId,
        update_settings: true,
    },

    chat_admin: {
        create: true,
        read: true,
        update: true,
        delete: true,
        update_settings: true,
    },
};
