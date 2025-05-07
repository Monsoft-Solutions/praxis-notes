import { createFileRoute } from '@tanstack/react-router';

import { AccountView } from '@src/stripe/views';

export const Route = createFileRoute('/_private/_app/account')({
    component: AccountView,
});
