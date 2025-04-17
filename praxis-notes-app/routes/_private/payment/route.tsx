import { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/payment')({
    component: PaymentLayout,
});

function PaymentLayout(): ReactElement {
    return <Outlet />;
}

import { Outlet } from '@tanstack/react-router';
