import { endpoints } from '../../api/providers/server';

// queries
import { getLoggedInUser } from './get-logged-in-user.query';
import { getBookmarkedUsers } from './get-bookmarked-users.query';

// mutations
import { signUp } from './sign-up.mutation';
import { verifyEmail } from './verify-email.mutation';
import { logIn } from './log-in.mutation';
import { logOut } from './log-out.mutation';
import { setHasDoneTour } from './set-has-done-tour.mutation';
// import { deleteOrganization } from './delete-organization.mutation';

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
    setHasDoneTour,
    // deleteOrganization,
});
