import { z } from 'zod';

import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';

import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';
import { eq } from 'drizzle-orm';

import { authServer } from '@auth/providers/server';

type User = {
    organizationId: string;
    roles: string[];
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined;
    language: string | null | undefined;
    bookmarked: boolean;
    hasDoneTour: boolean;
    lastName?: string | null | undefined;
};

type Session = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
    user: User;
};

type ApiContext = {
    headers: Headers;
    rawBody: string;
    session: Session | null;
};

// Server context created on every API request
export const apiContext = async ({ req }: CreateHTTPContextOptions) => {
    const headers = new Headers();

    const rawBody =
        z
            .object({
                rawBody: z.string(),
            })
            .safeParse(req).data?.rawBody ?? '';

    const ctx: ApiContext = {
        headers,
        rawBody,
        session: null,
    };

    Object.entries(req.headers).forEach(([key, value]) => {
        headers.append(key, value as string);
    });

    const sessionAndUser = await authServer.api.getSession({
        headers,
    });

    if (sessionAndUser === null) return ctx;

    const {
        session: { activeOrganizationId: organizationId, ...rawSession },
        user: rawUser,
    } = sessionAndUser;

    if (!organizationId) return ctx;

    const { data: userRoles, error: userRolesError } = await catchError(
        db.query.userRoleTable.findMany({
            where: ({ userId }) => eq(userId, rawUser.id),

            with: {
                role: true,
            },
        }),
    );

    if (userRolesError) return ctx;

    const roles = userRoles.map(({ role }) => role.name);

    const user = {
        ...rawUser,
        organizationId,
        roles,
    };

    const session = {
        ...rawSession,
        user,
    };

    ctx.session = session;

    return ctx;
};
