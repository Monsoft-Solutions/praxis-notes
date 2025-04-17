// import { TRPCError } from '@trpc/server';
// import type { Request } from 'express';
// import Stripe from 'stripe';
// import { z } from 'zod';
// import { eq } from 'drizzle-orm';

// import { publicEndpoint } from '@api/providers/server';
// import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
// import { catchError } from '@errors/utils/catch-error.util';
// import { Error, Success } from '@errors/utils';

// import { stripe } from '@src/stripe/config/stripe';
// import { db } from '@db/providers/server';
// import { stripeCustomerTable, stripeSubscriptionTable } from '../db';
// import { stripeEnv } from '@env/constants/stripe-env.constant';
// import { SubscriptionStatus } from '../types';

// // Input schema is not strictly needed as we parse raw body, but defines expectation
// const StripeWebhookInput = z.object({}); // Body is handled separately

// // --- Helper function to manage subscription data ---
// async function manageSubscriptionStatusChange(
//     subscriptionId: string,
//     customerId: string,
//     createAction: boolean,
// ) {
//     // Retrieve the subscription details from Stripe
//     const subResult = await catchError(
//         stripe.subscriptions.retrieve(subscriptionId, {
//             expand: ['default_payment_method'],
//         }),
//     );
//     if (subResult.error) {
//         console.error(
//             'Webhook Error: Failed to retrieve subscription from Stripe:',
//             subscriptionId,
//             subResult.error,
//         );
//         throw Error('Failed to retrieve subscription');
//     }
//     const subscription = subResult.data;

//     const subscrptionItemsResult = await catchError(
//         stripe.subscriptionItems.list({
//             subscription: subscriptionId,
//         }),
//     );
//     if (subscrptionItemsResult.error) {
//         console.error(
//             'Webhook Error: Failed to retrieve subscription items from Stripe:',
//             subscriptionId,
//             subscrptionItemsResult.error,
//         );
//         throw Error('Failed to retrieve subscription items');
//     }

//     const subscriptionItem = subscrptionItemsResult.data.data[0];

//     // Find the user ID linked to this Stripe customer ID
//     const customerMappingResult = await catchError(
//         db.query.stripeCustomerTable.findFirst({
//             where: eq(stripeCustomerTable.stripeCustomerId, customerId),
//             columns: { userId: true },
//         }),
//     );
//     if (customerMappingResult.error || !customerMappingResult.data) {
//         console.error(
//             'Webhook Error: No user found for Stripe customer:',
//             customerId,
//             customerMappingResult.error,
//         );
//         throw Error('User not found for customer');
//     }
//     const userId = customerMappingResult.data.userId;

//     // Ensure there's at least one item to get the price ID
//     if (!subscription.items.data.length) {
//         console.error(
//             'Webhook Error: Subscription has no items:',
//             subscriptionId,
//         );
//         throw Error('Subscription has no items');
//     }

//     const subscriptionData = {
//         id: subscription.id,
//         userId: userId,
//         priceId: subscriptionItem.price.id,
//         // Cast status, assuming Stripe statuses match DB enum values
//         status: subscription.status as SubscriptionStatus,
//         currentPeriodStart: subscriptionItem.current_period_start,
//         currentPeriodEnd: subscriptionItem.current_period_end,
//         cancelAtPeriodEnd: subscription.cancel_at_period_end,
//         canceledAt: subscription.canceled_at,
//         cancelAt: subscription.cancel_at,
//         trialStart: subscription.trial_start,
//         trialEnd: subscription.trial_end,
//     };

//     // Upsert the subscription data in the database
//     const upsertResult = await catchError(
//         db
//             .insert(stripeSubscriptionTable)
//             .values(subscriptionData)
//             .onConflictDoUpdate({
//                 target: stripeSubscriptionTable.id,
//                 set: subscriptionData,
//             }),
//     );
//     if (upsertResult.error) {
//         console.error(
//             'Webhook DB Error: Failed to upsert subscription:',
//             subscriptionId,
//             upsertResult.error,
//         );
//         throw Error('Database error updating subscription');
//     }

//     console.log(
//         `Webhook Handled: Subscription ${createAction ? 'created/updated' : 'updated/deleted'}: ${subscription.id}`,
//     );
// }
// // --- End Helper function ---

// export const stripeWebhook = publicEndpoint.input(StripeWebhookInput).mutation(
//     queryMutationCallback(async ({ ctx }) => {
//         // Assume ctx.req provides access to Express request
//         // NOTE: Getting raw body in tRPC often requires specific middleware (e.g., bodyParser.raw)
//         // This implementation assumes the raw body is available via a non-standard ctx property or prior middleware.
//         const req = ctx.req as Request & { rawBody?: Buffer };
//         const sig = req.headers['stripe-signature'] as string;
//         const webhookSecret = stripeEnv.STRIPE_WEBHOOK_SECRET;

//         if (!req.rawBody) {
//             console.error('Stripe Webhook Error: Raw body not available.');
//             throw new TRPCError({
//                 code: 'INTERNAL_SERVER_ERROR',
//                 message: 'Webhook error: Raw body not available.',
//             });
//         }

//         if (!sig || !webhookSecret) {
//             console.error('Stripe Webhook Error: Missing signature or secret.');
//             throw new TRPCError({
//                 code: 'BAD_REQUEST',
//                 message: 'Webhook error: Missing signature or secret.',
//             });
//         }

//         let event: Stripe.Event;

//         try {
//             event = stripe.webhooks.constructEvent(
//                 req.rawBody,
//                 sig,
//                 webhookSecret,
//             );
//         } catch (err: unknown) {
//             // Use unknown
//             console.error('Stripe Webhook Signature Verification Error:');
//             const message = 'Unknown signature verification error.';

//             console.error(JSON.stringify(err, null, 2));

//             throw new TRPCError({
//                 code: 'BAD_REQUEST',
//                 message: `Webhook Error: ${message}`,
//             });
//         }

//         // Handle the event
//         try {
//             switch (event.type) {
//                 case 'customer.subscription.created':
//                 case 'customer.subscription.updated':
//                 case 'customer.subscription.deleted': // Handles cancellations
//                     const subscription = event.data
//                         .object as Stripe.Subscription;
//                     await manageSubscriptionStatusChange(
//                         subscription.id,
//                         subscription.customer as string,
//                         event.type === 'customer.subscription.created',
//                     );
//                     break;
//                 case 'checkout.session.completed':
//                     const checkoutSession = event.data
//                         .object as Stripe.Checkout.Session;
//                     if (
//                         checkoutSession.mode === 'subscription' &&
//                         checkoutSession.subscription
//                     ) {
//                         // Handled by customer.subscription.created
//                         console.log(
//                             'Webhook Handled: Checkout session completed for subscription.',
//                         );
//                     } else if (
//                         checkoutSession.mode === 'payment' &&
//                         checkoutSession.payment_intent
//                     ) {
//                         // Handle one-time payment intent success if needed
//                         // Might involve creating a record in stripePaymentTable
//                         console.log(
//                             'Webhook Handled: Checkout session completed for one-time payment.',
//                         );
//                     } else {
//                         console.warn(
//                             'Webhook Warning: Unhandled checkout session mode:',
//                             checkoutSession.mode,
//                         );
//                     }
//                     break;
//                 case 'invoice.paid':
//                     // Used for recurring payments. Update subscription details.
//                     const invoicePaid = event.data.object as Stripe.Invoice;

//                     await manageSubscriptionStatusChange(
//                         'subscription_id',
//                         invoicePaid.customer as string,
//                         false, // Not a creation event
//                     );
//                     break;
//                 case 'invoice.payment_failed':
//                     // The payment failed or the customer does not have a valid payment method.
//                     // The subscription becomes past_due. Notify customer.
//                     const invoiceFailed = event.data.object as Stripe.Invoice;
//                     // Potentially update local status or trigger notifications
//                     console.warn(
//                         'Webhook Handled: Invoice payment failed:',
//                         invoiceFailed.id,
//                     );
//                     break;
//                 case 'payment_intent.succeeded':
//                     // Handle successful one-time payments if using Payment Intents directly
//                     const paymentIntent = event.data
//                         .object as Stripe.PaymentIntent;
//                     // Log payment in stripePaymentTable if needed
//                     console.log(
//                         'Webhook Handled: PaymentIntent succeeded:',
//                         paymentIntent.id,
//                     );
//                     break;
//                 default:
//                     console.log(
//                         `Webhook Received: Unhandled event type ${event.type}`,
//                     );
//             }
//             // Return Success, even if specific event wasn't handled here
//             return Success({ received: true });
//         } catch (err) {
//             // Use unknown
//             console.error('Webhook handling error:');
//             const message = 'Unknown webhook handling error.';

//             console.error(JSON.stringify(err, null, 2));

//             console.error(message);
//             // Use Error() wrapper as per rule for handler errors
//             return Error('WEBHOOK_HANDLER_ERROR');
//         }
//     }),
// );
