import { createFileRoute } from '@tanstack/react-router';

import { PaymentCancelView } from '../../../../src/stripe/views';

export const Route = createFileRoute('/_private/payment/cancel')({
    component: PaymentCancelView,
});
