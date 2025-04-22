import { organizationSeed } from './oraganization.seed';
import { userSeed } from './user.seed';
import { authenticationSeed } from './authentication.seed';

export const authSeed = async () => {
    await organizationSeed();
    await userSeed();
    await authenticationSeed();
};
