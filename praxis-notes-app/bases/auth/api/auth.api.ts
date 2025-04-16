import { endpoints } from '../../api/providers/server';

// queries
import { getLoggedInUser } from './get-logged-in-user.query';
import { getBookmarkedUsers } from './get-bookmarked-users.query';

// mutations
import { logIn } from './log-in.mutation';
import { logOut } from './log-out.mutation';
import { signUp } from './sign-up.mutation';

// auth endpoints
export const authApi = endpoints({
    getLoggedInUser,
    getBookmarkedUsers,

    // mutations
    signUp,
    logIn,
    logOut,
});
