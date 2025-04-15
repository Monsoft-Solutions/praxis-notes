import { endpoints } from '../../api/providers/server';

import { getLoggedInUser } from './get-logged-in-user.query';
import { getBookmarkedUsers } from './get-bookmarked-users.query';

import { logIn } from './log-in.mutation';
import { logOut } from './log-out.mutation';

// Auth endpoints
export const authApi = endpoints({
    getLoggedInUser,
    getBookmarkedUsers,

    logIn,
    logOut,
});
