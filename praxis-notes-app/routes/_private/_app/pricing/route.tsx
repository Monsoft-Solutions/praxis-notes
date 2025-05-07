import { createFileRoute } from '@tanstack/react-router';

import { PricingView } from '@src/stripe/views';

export const Route = createFileRoute('/_private/_app/pricing')({
    component: PricingView,
});
