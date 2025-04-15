# Stripe Integration Implementation Plan

This document outlines the steps to integrate Stripe payments into the monorepo application, following the established project structure and conventions.

## 1. Setup and Configuration

1.  **Create Stripe Module:**
    - Create a new feature module directory: `src/stripe`.
    - Initialize standard subdirectories within `src/stripe`: `api`, `components`, `config`, `constants`, `db`, `hooks`, `schemas`, `types`, `utils`, `views`.
2.  **Environment Variables:**
    - Add Stripe API keys (`STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) to the environment variable schema (likely located in `env/schema.ts` or similar).
    - Add the keys to the local `praxis-notes-app/.env-cmdrc`.
    - Load these variables using the existing environment variable setup (`env-cmd`, `cross-env`, Zod validation).
3.  **Stripe SDK Initialization:**
    - Create `src/stripe/config/stripe.ts`.
    - Initialize the Stripe Node.js SDK using the `STRIPE_SECRET_KEY`. Export the initialized Stripe instance.
    - Potentially create a separate config for the frontend using `STRIPE_PUBLIC_KEY`.

## 2. Database Integration (Drizzle ORM)

1.  **Define Tables:**
    - Create table definition files within `src/stripe/db/tables/` following the `table.rules.mdc` guidelines.
    - Potential tables:
        - `stripe_customers`: Maps application users to Stripe Customer IDs (`userId` FK, `stripeCustomerId`).
        - `stripe_products`: Stores Stripe Product IDs relevant to the application.
        - `stripe_prices`: Stores Stripe Price IDs linked to products.
        - `stripe_subscriptions`: Tracks user subscriptions (`userId` FK, `stripeSubscriptionId`, `stripePriceId` FK, `status`, `currentPeriodEnd`, etc.).
        - `stripe_payments`: Logs payment intents or charges (`userId` FK, `stripePaymentIntentId`, `amount`, `status`, `createdAt`).
    - Remember to define relations using `relations` from `drizzle-orm`.
2.  **Migrations:**
    - Generate database migrations: `npm run generate`.
    - Apply migrations: `npm run migrate`.
3.  **Seeding (Optional):**
    - If necessary, add seed data for Stripe products/prices in `seed/`.

## 3. Backend API (tRPC)

1.  **Create Stripe Router:**
    - Define tRPC procedures for Stripe operations.
2.  **Implement Procedures:**
    - `createCheckoutSession`: Accepts product/price ID, user ID, success/cancel URLs. Creates a Stripe Checkout Session and returns the session ID/URL for client-side redirection to Stripe's hosted checkout page.
    - `getCustomerPortalSession`: Creates a Stripe Billing Portal session for subscription management.
    - Procedures to fetch user subscription status or payment history from the database.
3.  **Webhook Handler:**
    - Create a dedicated webhook endpoint (e.g., using Express middleware in `app/server/` or a specific tRPC procedure if preferred).
    - Path: `/api/stripe/webhooks` (or similar).
    - Verify webhook signatures using `STRIPE_WEBHOOK_SECRET`.
    - Handle relevant Stripe events (e.g., `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `payment_intent.succeeded`):
        - Update database tables (`stripe_customers`, `stripe_subscriptions`, `stripe_payments`) based on event data.
        - Create customer records, update subscription statuses, log payments.
4.  **Integrate Router:**
    - Import and merge the `stripeRouter` into the main application tRPC router (likely in `api/index.ts` or `app/server/trpc.ts`).
5.  **Authorization:**
    - Apply appropriate authorization guards (`guard/`) to Stripe procedures to ensure only authenticated users can perform actions related to their account.

## 4. Frontend Integration (React + Tanstack Router)

1.  **Stripe.js Setup:**
    - Install `@stripe/stripe-js` and `@stripe/react-stripe-js`.
    - Wrap relevant parts of the application (or the entire app in `app/web/main.tsx`) with `<Elements>` provider from `@stripe/react-stripe-js`, initializing it with the `STRIPE_PUBLIC_KEY`. **Note:** While `<Elements>` is primarily for Stripe Elements, it might still be useful for other Stripe.js functionality or future needs, but it's not strictly required _just_ for redirecting to Checkout. Consider if it's needed for other Stripe interactions.
2.  **Components:**
    - Create reusable React components in `src/stripe/components/`:
        - `CheckoutButton`: A button that calls the `createCheckoutSession` backend procedure and uses the returned session ID/URL to redirect the user to the Stripe Checkout page using `redirectToCheckout` from `@stripe/stripe-js`.
        - `SubscriptionManagement`: Displays current subscription status and provides a button to redirect to the Stripe Billing Portal (using `getCustomerPortalSession`).
3.  **Hooks:**
    - Create React hooks in `src/stripe/hooks/` using Tanstack Query (or the project's chosen state management/data fetching library):
        - `useCreateCheckoutSession`: Mutation hook to call the `createCheckoutSession` tRPC procedure and handle the redirect.
        - `useSubscriptionStatus`: Query hook to fetch the user's subscription data from the backend.
4.  **Views/Routing:**
    - Create new route views in `src/stripe/views/` if needed (e.g., for a dedicated pricing page, payment success/cancel pages).
    - Define routes in `routes/` using Tanstack Router, integrating the Stripe views and components.
    - Handle redirects from Stripe Checkout (success/cancel URLs).

## 5. Shared Logic

1.  **Types/Schemas/Constants:**
    - Define shared TypeScript types (`src/stripe/types/`), Zod schemas (`src/stripe/schemas/`), and constants (`src/stripe/constants/`) used across backend and frontend Stripe logic (e.g., subscription statuses, event types).

## 6. Testing

1.  **Backend:** Write integration tests for tRPC procedures and the webhook handler. Mock Stripe API calls and database interactions.
2.  **Frontend:** Write component and integration tests for Stripe components and hooks. Use `@stripe/react-stripe-js` testing utilities if applicable.
3.  **End-to-End:** Create E2E tests covering the full payment/subscription flows.

## 7. Documentation

1.  Add a `README.md` inside `src/stripe` explaining the module's purpose, setup, and how to use the components/hooks.
2.  Update the main project `README.md` if necessary to mention Stripe integration.
3.  Document the webhook endpoint and required environment variables.

This plan provides a structured approach. Specific implementation details might need adjustments based on the exact application requirements (e.g., specific subscription models, one-time payment needs).
