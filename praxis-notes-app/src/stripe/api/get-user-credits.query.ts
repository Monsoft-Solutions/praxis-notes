import { protectedEndpoint } from '@api/providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { Success } from '@errors/utils';
import { getUserCredits } from '../../../bases/credits/user/providers/server';

export const getUserCreditsQuery = protectedEndpoint.query(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user: sessionUser },
            },
        }) => {
            const { data: userCredits } = await getUserCredits({
                userId: sessionUser.id,
            });

            return Success({
                credits: userCredits,
            });
        },
    ),
);
