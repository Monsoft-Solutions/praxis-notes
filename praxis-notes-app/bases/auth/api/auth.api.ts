import { endpoints } from '../../api/providers/server';

// queries
import { getLoggedInUser } from './get-logged-in-user.query';
import { getBookmarkedUsers } from './get-bookmarked-users.query';
import { verifyEmail } from './verify-email.query';

// mutations
import { logIn } from './log-in.mutation';
import { logOut } from './log-out.mutation';
import { signUp } from './sign-up.mutation';
import { deleteOrganization } from './delete-organization.mutation';

// auth endpoints
export const authApi = endpoints({
    // queries
    getLoggedInUser,
    getBookmarkedUsers,

    // mutations
    signUp,
    verifyEmail,
    logIn,
    logOut,
    deleteOrganization,
});
