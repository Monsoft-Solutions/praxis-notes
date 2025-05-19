import { TRPCError } from '@trpc/server';
import Stripe from 'stripe';
import { z } from 'zod';

import { publicEndpoint } from '@api/providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { catchError } from '@errors/utils/catch-error.util';
import { Error, Success } from '@errors/utils';

import { createStripeSdk } from '../utils/create-stripe-sdk.util';
import { getCoreConf } from '@conf/providers/server';
import {
    sendPaymentConfirmationEmail,
    sendSubscriptionStatusEmail,
} from '../providers';
import { logger } from '@logger/providers';

// --- Helper function to manage subscription data ---
async function manageSubscriptionStatusChange(
    subscriptionId: string,
    customerId: string,
    createAction: boolean,
) {
    const { data: stripe, error: stripeCreateError } = await createStripeSdk();

    if (stripeCreateError) return Error();
    // Retrieve the subscription details from Stripe
    const subResult = await catchError(
        stripe.subscriptions.retrieve(subscriptionId, {
            expand: [
                'default_payment_method',
                'customer',
                'items.data.price.product',
            ],
        }),
    );
    if (subResult.error) {
        console.error(
            'Webhook Error: Failed to retrieve subscription from Stripe:',
            subscriptionId,
            subResult.error,
        );
        throw Error('Failed to retrieve subscription');
    }
    const subscription = subResult.data;

    const subscrptionItemsResult = await catchError(
        stripe.subscriptionItems.list({
            subscription: subscriptionId,
        }),
    );
    if (subscrptionItemsResult.error) {
        console.error(
            'Webhook Error: Failed to retrieve subscription items from Stripe:',
            subscriptionId,
            subscrptionItemsResult.error,
        );
        throw Error('Failed to retrieve subscription items');
    }

    const subscriptionItem = subscrptionItemsResult.data.data[0];

    // Get customer information
    const customerResult = await catchError(
        stripe.customers.retrieve(customerId),
    );

    if (customerResult.error) {
        console.error(
            'Webhook Error: Failed to retrieve customer from Stripe:',
            customerId,
            customerResult.error,
        );
        throw Error('Failed to retrieve customer');
    }

    const customer = customerResult.data as Stripe.Customer;

    console.log(
        `Webhook Handled: Subscription ${createAction ? 'created/updated' : 'updated/deleted'}: ${subscription.id}`,
    );

    // Send appropriate email based on the subscription status change
    try {
        const email = customer.email;
        const firstName = customer.name?.split(' ')[0] ?? 'Customer';
        const lastName = customer.name?.split(' ').slice(1).join(' ') ?? '';
        const language = customer.preferred_locales?.[0] ?? 'en';

        // Get product information to use as plan name
        let productName: string;
        if (typeof subscriptionItem.price.product === 'string') {
            const product = await catchError(
                stripe.products.retrieve(subscriptionItem.price.product),
            );
            if (product.error) {
                console.error(
                    'Webhook Error: Failed to retrieve product:',
                    product.error,
                );
                throw Error('Failed to retrieve product');
            }
            productName = product.data.name;
        } else {
            productName = 'SUBSCRIPTION';
        }

        // Format price
        const priceAmount = subscriptionItem.price.unit_amount
            ? (subscriptionItem.price.unit_amount / 100).toFixed(2)
            : '0.00';
        const currency = subscriptionItem.price.currency.toUpperCase();
        const formattedPrice = `${currency} ${priceAmount}/${subscriptionItem.price.recurring?.interval ?? 'month'}`;

        // Format dates

        const startPeriod =
            subscription.items.data[0].current_period_start * 1000;
        const endPeriod = subscription.items.data[0].current_period_end * 1000;
        const startDate = new Date(startPeriod).toLocaleDateString();
        const nextRenewal = new Date(endPeriod).toLocaleDateString();
        const cancelDate = subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toLocaleDateString()
            : undefined;

        // Set status for email template
        let status: 'created' | 'updated' | 'canceled';
        if (createAction) {
            status = 'created';
        } else if (subscription.status === 'canceled') {
            status = 'canceled';
        } else {
            status = 'updated';
        }

        // Generate management URL
        const managementUrl = 'https://app.praxisnotes.com/account/billing'; // Replace with actual URL

        await sendSubscriptionStatusEmail({
            email: email ?? 'test@test.com',
            firstName,
            lastName,
            language,
            status,
            planName: productName,
            price: formattedPrice,
            startDate,
            nextRenewal,
            cancelDate,
            managementUrl,
        });

        console.log(
            `Email sent: Subscription ${status} notification to ${email}`,
        );
    } catch (err) {
        console.error('Failed to send subscription email:', err);
    }
}

function handleInvoiceCreated(event: Stripe.InvoiceCreatedEvent) {
    console.log('Invoice created');

    // Marking variables as unused to satisfy linter
    const _hostedInvoiceUrl = event.data.object.hosted_invoice_url;
    const _customerEmail = event.data.object.customer_email;
    const _invoiceId = event.data.object.id;
    const _customerId = event.data.object.customer;
    const _status = event.data.object.status;
    const _lineItems = event.data.object.lines.data;

    // TODO: Implement logic to send email to customer with hostedInvoiceUrl
}

async function handleInvoicePaymentSucceeded(
    event: Stripe.InvoicePaymentSucceededEvent,
) {
    console.log('Invoice payment succeeded');

    try {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        // Get customer information
        const { data: stripe, error: stripeCreateError } =
            await createStripeSdk();
        if (stripeCreateError) {
            console.error(
                'Failed to create Stripe SDK for email:',
                stripeCreateError,
            );
            return;
        }

        const customerResult = await catchError(
            stripe.customers.retrieve(customerId),
        );

        if (customerResult.error) {
            console.error(
                'Failed to retrieve customer for email:',
                customerResult.error,
            );
            return;
        }

        const customer = customerResult.data as Stripe.Customer;

        if (!customer.email || !invoice.hosted_invoice_url) {
            console.error('Missing email or invoice URL for payment email');
            return;
        }

        // Format amount
        const amountPaid = invoice.amount_paid
            ? `${invoice.currency.toUpperCase()} ${(invoice.amount_paid / 100).toFixed(2)}`
            : 'N/A';

        // Format date
        const paymentDate = new Date().toLocaleDateString();

        await sendPaymentConfirmationEmail({
            email: customer.email,
            firstName: customer.name?.split(' ')[0] ?? 'Customer',
            lastName: customer.name?.split(' ').slice(1).join(' ') ?? '',
            language: customer.preferred_locales?.[0] ?? 'en',
            amount: amountPaid,
            date: paymentDate,
            invoiceId: invoice.id ?? 'invoice_id',
            invoiceUrl: invoice.hosted_invoice_url,
        });

        console.log(`Payment confirmation email sent to ${customer.email}`);
    } catch (err) {
        console.error('Failed to send payment confirmation email:', err);
    }
}

function handleInvoicePaymentFailed(event: Stripe.InvoicePaymentFailedEvent) {
    console.log('Invoice payment failed', event.data.object);
    // TODO: Implement email for failed payments
}

function handleCustomerCreated(event: Stripe.CustomerCreatedEvent) {
    console.log('Customer created', event.data.object);
}

function handleCustomerUpdated(event: Stripe.CustomerUpdatedEvent) {
    console.log('Customer updated', event.data.object);
}

function handleCustomerDeleted(event: Stripe.CustomerDeletedEvent) {
    console.log('Customer deleted', event.data.object);
}

// --- End Helper function ---

export const stripeWebhook = publicEndpoint.input(z.unknown()).mutation(
    queryMutationCallback(async ({ ctx, input }) => {
        if (!ctx.rawBody) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message:
                    'Webhook error: Raw body required to verify webhook signature.',
            });
        }

        const { data: stripe, error: stripeCreateError } =
            await createStripeSdk();

        if (stripeCreateError) return Error();

        const coreConfWithError = await getCoreConf();

        const { error: coreConfError } = coreConfWithError;

        if (coreConfError !== null) return Error('MISSING_CORE_CONF');

        const { data: coreConf } = coreConfWithError;

        const { stripeWebhookSecret } = coreConf;

        const sig = ctx.headers.get('stripe-signature');

        if (!input) {
            console.error('Stripe Webhook Error: Raw body not available.');
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Webhook error: Raw body not available.',
            });
        }

        if (!sig || !stripeWebhookSecret) {
            console.error('Stripe Webhook Error: Missing signature or secret.');
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Webhook error: Missing signature or secret.',
            });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                ctx.rawBody,
                sig,
                stripeWebhookSecret,
            );
        } catch (err: unknown) {
            // Use unknown
            logger.error('Stripe Webhook Signature Verification Error:');

            logger.error(JSON.stringify(err, null, 2));

            throw new TRPCError({
                code: 'BAD_REQUEST',
            });
        }

        // Handle the event
        try {
            switch (event.type) {
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted': // Handles cancellations
                    await manageSubscriptionStatusChange(
                        event.data.object.id,
                        event.data.object.customer as string,
                        event.type === 'customer.subscription.created',
                    );
                    break;
                case 'checkout.session.completed':
                    if (
                        event.data.object.mode === 'subscription' &&
                        event.data.object.subscription
                    ) {
                        // Handled by customer.subscription.created
                        console.log(
                            'Webhook Handled: Checkout session completed for subscription.',
                        );
                    } else if (
                        event.data.object.mode === 'payment' &&
                        event.data.object.payment_intent
                    ) {
                        // Handle one-time payment intent success if needed
                        // Might involve creating a record in stripePaymentTable
                        console.log(
                            'Webhook Handled: Checkout session completed for one-time payment.',
                        );
                    } else {
                        console.warn(
                            'Webhook Warning: Unhandled checkout session mode:',
                            event.data.object.mode,
                        );
                    }
                    break;
                // case 'invoice.paid':
                //     // Used for recurring payments. Update subscription details.
                //     if (event.data.object.subscription) {
                //         await manageSubscriptionStatusChange(
                //             event.data.object.subscription as string,
                //             event.data.object.customer as string,
                //             false, // Not a creation event
                //         );
                //     }
                //     // Send payment confirmation email
                //     await handleInvoicePaymentSucceeded(event);
                //     break;
                case 'payment_intent.succeeded':
                    // Handle successful one-time payments if using Payment Intents directly
                    // Log payment in stripePaymentTable if needed
                    break;
                case 'invoice.created':
                    handleInvoiceCreated(event);
                    break;
                case 'invoice.payment_succeeded':
                    await handleInvoicePaymentSucceeded(event);
                    break;
                case 'invoice.payment_failed':
                    handleInvoicePaymentFailed(event);
                    break;
                case 'customer.created':
                    handleCustomerCreated(event);
                    break;
                case 'customer.updated':
                    handleCustomerUpdated(event);
                    break;
                case 'customer.deleted':
                    handleCustomerDeleted(event);
                    break;
                default:
                    console.log(
                        `Webhook Received: Unhandled event type ${event.type}`,
                    );
            }
            // Return Success, even if specific event wasn't handled here
            return Success({ received: true });
        } catch (err) {
            // Use unknown
            console.error('Webhook handling error:');
            const message = 'Unknown webhook handling error.';

            console.error(JSON.stringify(err, null, 2));

            console.error(message);
            // Use Error() wrapper as per rule for handler errors
            return Error('WEBHOOK_HANDLER_ERROR');
        }
    }),
);
