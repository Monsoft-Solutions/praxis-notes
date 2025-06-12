# Stripe and Credits System Analysis & Implementation Plan

## Executive Summary

This document provides a comprehensive analysis of the current Stripe module and credits system implementation in the Praxis Notes application. It identifies critical gaps, missing functionality, and provides a detailed implementation plan to complete the integration.

## Current State Analysis

### 1. Stripe Module Structure

The Stripe module exists at `praxis-notes-app/src/stripe/` with the following structure:

- ✅ Basic folder structure (api, components, db, schemas, types, utils, views)
- ✅ Stripe SDK initialization utility
- ✅ Basic webhook handler structure
- ✅ Some API endpoints (checkout session, customer portal, subscription status)
- ❌ Incomplete database schema
- ❌ Missing critical functionality

### 2. Database Schema Issues

#### Existing Tables:

- `stripe_subscription_credits` - Maps Stripe price IDs to credit amounts

#### Missing Tables:

- `stripe_subscriptions` - Track subscription details
- `stripe_products` - Store product information
- `stripe_prices` - Store price information
- `stripe_payments` - Log payment history

### 3. Credits System Analysis

#### Current Implementation:

- ✅ User credits table exists (`user_credits`)
- ✅ Credit consumption logic for note generation
- ✅ Credit display component
- ❌ No connection between Stripe subscriptions and credits
- ❌ Fixed maximum credits (100) instead of plan-based
- ❌ No automatic credit assignment on subscription

### 4. Critical Missing Functionality

1. **Webhook Handler Gaps:**

    - Doesn't update user credits on subscription events
    - Doesn't store subscription data in database
    - Doesn't query `stripe_subscription_credits` table

2. **Credit Assignment Logic:**

    - No function to assign credits based on Stripe price ID
    - No tracking of credit assignment history
    - No recurring credit refresh on billing cycle

3. **API Endpoints Missing:**
    - CRUD operations for `stripe_subscription_credits`
    - Credit purchase endpoints
    - Credit history endpoints

## Implementation Plan

### Phase 1: Database Schema Completion

#### 1.1 Create Missing Tables

-- stripe_subscriptions table
CREATE TABLE stripe_subscriptions (
id VARCHAR(36) PRIMARY KEY,
user_id VARCHAR(36) NOT NULL REFERENCES users(id),
stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
stripe_customer_id VARCHAR(255) NOT NULL,
stripe_price_id VARCHAR(255) NOT NULL,
status VARCHAR(50) NOT NULL,
current_period_start BIGINT,
current_period_end BIGINT,
cancel_at_period_end BOOLEAN DEFAULT FALSE,
created_at BIGINT NOT NULL,
updated_at BIGINT NOT NULL
);

-- stripe_products table
CREATE TABLE stripe_products (
id VARCHAR(36) PRIMARY KEY,
stripe_product_id VARCHAR(255) NOT NULL UNIQUE,
name VARCHAR(255) NOT NULL,
description TEXT,
active BOOLEAN DEFAULT TRUE,
metadata JSON,
created_at BIGINT NOT NULL,
updated_at BIGINT NOT NULL
);

-- stripe_prices table
CREATE TABLE stripe_prices (
id VARCHAR(36) PRIMARY KEY,
stripe_price_id VARCHAR(255) NOT NULL UNIQUE,
stripe_product_id VARCHAR(255) NOT NULL,
amount BIGINT NOT NULL,
currency VARCHAR(10) NOT NULL,
interval VARCHAR(20),
interval_count INT,
active BOOLEAN DEFAULT TRUE,
metadata JSON,
created_at BIGINT NOT NULL,
updated_at BIGINT NOT NULL
);

-- stripe_payments table
CREATE TABLE stripe_payments (
id VARCHAR(36) PRIMARY KEY,
user_id VARCHAR(36) NOT NULL REFERENCES users(id),
stripe_payment_intent_id VARCHAR(255) UNIQUE,
stripe_invoice_id VARCHAR(255),
amount BIGINT NOT NULL,
currency VARCHAR(10) NOT NULL,
status VARCHAR(50) NOT NULL,
description TEXT,
created_at BIGINT NOT NULL
);

-- user_credit_transactions table (for credit history)
CREATE TABLE user_credit_transactions (
id VARCHAR(36) PRIMARY KEY,
user_id VARCHAR(36) NOT NULL REFERENCES users(id),
transaction_type VARCHAR(50) NOT NULL, -- 'subscription', 'purchase', 'consume', 'refund'
amount INT NOT NULL, -- positive for additions, negative for consumption
balance_after INT NOT NULL,
description TEXT,
metadata JSON,
created_at BIGINT NOT NULL
);

````

### Phase 2: Update Credits System

#### 2.1 Modify User Credits Structure

1. Update `userCreditsMax` to be dynamic based on subscription:

```typescript
// Add plan-based credit limits
export const planCreditsMax: Record<string, UserCredits> = {
    price_individual_monthly: { generateNotes: 30 },
    price_individual_yearly: { generateNotes: 30 },
    price_pro_monthly: { generateNotes: 60 },
    price_pro_yearly: { generateNotes: 60 },
    price_team_monthly: { generateNotes: 200 },
    price_team_yearly: { generateNotes: 200 },
    default: { generateNotes: 10 }, // Free tier
};
````

#### 2.2 Create Credit Assignment Functions

```typescript
// src/stripe/providers/server/assign-subscription-credits.provider.ts
export const assignSubscriptionCredits = async ({
    userId,
    stripePriceId,
    isNewSubscription = true,
}: {
    userId: string;
    stripePriceId: string;
    isNewSubscription?: boolean;
}) => {
    // 1. Query stripe_subscription_credits table for credit amount
    const creditMapping =
        await db.query.stripeSubscriptionCreditsTable.findFirst({
            where: (record, { eq, and }) =>
                and(
                    eq(record.stripePriceId, stripePriceId),
                    eq(record.isActive, true),
                ),
        });

    if (!creditMapping) {
        return Error('NO_CREDIT_MAPPING');
    }

    const { creditsAmount } = creditMapping;

    // 2. Update user credits
    if (isNewSubscription) {
        // Set credits to the plan amount
        await setUserCredits({
            userId,
            credits: { generateNotes: creditsAmount },
        });
    } else {
        // Add credits to existing balance (for renewals)
        const currentCredits = await getUserCredits({ userId });
        await setUserCredits({
            userId,
            credits: {
                generateNotes:
                    currentCredits.data.generateNotes + creditsAmount,
            },
        });
    }

    // 3. Log transaction
    await db.insert(userCreditTransactionsTable).values({
        id: uuidv4(),
        userId,
        transactionType: 'subscription',
        amount: creditsAmount,
        balanceAfter: creditsAmount,
        description: `Credits assigned from subscription (${stripePriceId})`,
        metadata: { stripePriceId },
        createdAt: Date.now(),
    });

    return Success();
};
```

### Phase 3: Webhook Handler Enhancement

#### 3.1 Update Subscription Management Function

```typescript
async function manageSubscriptionStatusChange(
    subscriptionId: string,
    customerId: string,
    createAction: boolean,
) {
    // ... existing code ...

    // After retrieving subscription details:

    // 1. Get or create stripe customer record
    const userIdResult = await getOrCreateStripeCustomerRecord(customerId);
    if (userIdResult.error) return;

    const userId = userIdResult.data.userId;

    // 2. Update subscription record in database
    await upsertStripeSubscription({
        userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        stripePriceId: subscriptionItem.price.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    // 3. Assign credits if new subscription or renewal
    if (createAction || subscription.status === 'active') {
        const creditResult = await assignSubscriptionCredits({
            userId,
            stripePriceId: subscriptionItem.price.id,
            isNewSubscription: createAction,
        });

        if (creditResult.error) {
            logger.error('Failed to assign credits:', creditResult.error);
        }
    }

    // ... continue with email sending ...
}
```

### Phase 4: API Endpoints Implementation

#### 4.1 Stripe Subscription Credits Management

```typescript
// src/stripe/api/stripe-subscription-credits.api.ts

// List all credit mappings
export const listSubscriptionCredits = adminEndpoint.query(
    queryMutationCallback(async () => {
        const mappings = await db.query.stripeSubscriptionCreditsTable.findMany(
            {
                where: (record, { eq }) => eq(record.isActive, true),
            },
        );
        return Success(mappings);
    }),
);

// Create credit mapping
export const createSubscriptionCredits = adminEndpoint
    .input(createStripeSubscriptionCreditsSchema)
    .mutation(
        queryMutationCallback(async ({ input }) => {
            const mapping = await db
                .insert(stripeSubscriptionCreditsTable)
                .values({
                    id: uuidv4(),
                    ...input,
                    createdAt: Date.now(),
                })
                .returning();
            return Success(mapping[0]);
        }),
    );

// Update credit mapping
export const updateSubscriptionCredits = adminEndpoint
    .input(updateStripeSubscriptionCreditsSchema)
    .mutation(
        queryMutationCallback(async ({ input }) => {
            const { id, ...updates } = input;
            await db
                .update(stripeSubscriptionCreditsTable)
                .set(updates)
                .where(eq(stripeSubscriptionCreditsTable.id, id));
            return Success();
        }),
    );
```

#### 4.2 Credit History Endpoint

```typescript
// src/stripe/api/credit-history.query.ts
export const getCreditHistory = protectedEndpoint.query(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user },
            },
        }) => {
            const transactions =
                await db.query.userCreditTransactionsTable.findMany({
                    where: (record, { eq }) => eq(record.userId, user.id),
                    orderBy: (record, { desc }) => [desc(record.createdAt)],
                    limit: 50,
                });
            return Success(transactions);
        },
    ),
);
```

### Phase 5: Frontend Updates

#### 5.1 Update User Credits Component

```typescript
// Update to show plan-based maximum
export function UserCredits(): ReactElement {
    const { data: userCreditsQuery } =
        api.stripe.getUserCreditsQuery.useQuery();
    const { data: subscriptionQuery } =
        api.stripe.getSubscriptionStatus.useQuery();

    // Get maximum credits based on subscription
    const getMaxCredits = () => {
        if (!subscriptionQuery?.data) return 10; // Free tier
        const priceId = subscriptionQuery.data.priceId;
        return planCreditsMax[priceId]?.generateNotes || 10;
    };

    const totalCredits = getMaxCredits();
    // ... rest of component with dynamic totalCredits
}
```

### Phase 6: Testing & Documentation

#### 6.1 Testing Requirements

1. **Unit Tests:**

    - Credit assignment logic
    - Webhook signature verification
    - Database operations

2. **Integration Tests:**

    - Full subscription flow
    - Credit consumption and refill
    - Webhook processing

3. **E2E Tests:**
    - Complete payment flow
    - Subscription management
    - Credit usage

#### 6.2 Documentation Updates

1. Update API documentation with new endpoints
2. Create admin guide for managing credit mappings
3. Update user documentation with credit system details

## Migration Steps

1. **Backup existing data**
2. **Create new database tables**
3. **Populate stripe_subscription_credits table:**
    ```sql
    INSERT INTO stripe_subscription_credits (id, stripe_price_id, credits_amount, created_at, is_active) VALUES
    ('uuid1', 'price_individual_monthly', 30, UNIX_TIMESTAMP(), true),
    ('uuid2', 'price_individual_yearly', 30, UNIX_TIMESTAMP(), true),
    ('uuid3', 'price_pro_monthly', 60, UNIX_TIMESTAMP(), true),
    ('uuid4', 'price_pro_yearly', 60, UNIX_TIMESTAMP(), true),
    ('uuid5', 'price_team_monthly', 200, UNIX_TIMESTAMP(), true),
    ('uuid6', 'price_team_yearly', 200, UNIX_TIMESTAMP(), true);
    ```
4. **Deploy webhook handler updates**
5. **Test with Stripe test mode**
6. **Monitor for issues**
7. **Switch to production mode**

## Timeline Estimate

- Phase 1 (Database): ✅ COMPLETED
- Phase 2 (Credits System): 3-4 days
- Phase 3 (Webhook): 2-3 days
- Phase 4 (API): 2-3 days
- Phase 5 (Frontend): 2-3 days
- Phase 6 (Testing): 3-4 days

**Total: 14-20 days**

## Implementation Progress

### Phase 1: Database Schema Completion ✅

Completed the creation of all missing database tables:

- `stripe_subscriptions` - Tracks user subscriptions and their status
- `stripe_products` - Stores product information from Stripe
- `stripe_prices` - Stores price information from Stripe
- `stripe_payments` - Logs payment intents and charges
- `user_credit_transactions` - Tracks all credit additions and consumption

Created enums for proper type safety:

- `stripe-subscription-status.enum.ts` - For subscription statuses (active, canceled, incomplete, etc.)
- `transaction-type.enum.ts` - For credit transaction types (subscription, purchase, consume, refund, etc.)
- `payment-status.enum.ts` - For payment statuses (succeeded, pending, failed, etc.)

All tables follow the project's standards:

- Using bigint for timestamps
- Using PostgreSQL enums for status fields
- Proper relations defined
- Descriptive comments
- Appropriate column types
- Exported in the main db.tables file

Migration generated: `0062_loud_living_tribunal.sql`

## Risk Mitigation

1. **Data Loss:** Implement comprehensive backups before migration
2. **Webhook Failures:** Add retry logic and dead letter queue
3. **Credit Miscalculation:** Implement audit trails and monitoring
4. **Performance:** Add database indexes on frequently queried fields

## Success Metrics

1. All subscriptions correctly mapped to users
2. Credits automatically assigned on subscription events
3. No manual intervention required for credit management
4. < 1% webhook failure rate
5. Complete audit trail for all credit transactions
