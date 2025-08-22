import { v4 as uuidv4 } from 'uuid';
import { db } from '@db/providers/server';
import { stripeSubscriptionCreditsTable } from '../db';

/**
 * Seed data for stripe_subscription_credits table
 * Maps Stripe price IDs to credit amounts for each plan
 */
export const seedStripeSubscriptionCredits = async () => {
    const now = Date.now();

    const creditMappings = [
        // Individual plans
        { stripePriceId: 'price_individual_monthly', creditsAmount: 30 },
        { stripePriceId: 'price_individual_yearly', creditsAmount: 30 },

        // Pro plans
        { stripePriceId: 'price_pro_monthly', creditsAmount: 60 },
        { stripePriceId: 'price_pro_yearly', creditsAmount: 60 },

        // Team plans
        { stripePriceId: 'price_team_monthly', creditsAmount: 200 },
        { stripePriceId: 'price_team_yearly', creditsAmount: 200 },
    ];

    try {
        // Check if data already exists
        const existingMappings =
            await db.query.stripeSubscriptionCreditsTable.findMany();

        if (existingMappings.length > 0) {
            console.log('Stripe subscription credits already seeded');
            return;
        }

        // Insert credit mappings
        const insertPromises = creditMappings.map((mapping) =>
            db.insert(stripeSubscriptionCreditsTable).values({
                id: uuidv4(),
                stripePriceId: mapping.stripePriceId,
                creditsAmount: mapping.creditsAmount,
                createdAt: now,
                isActive: true,
            }),
        );

        await Promise.all(insertPromises);

        console.log(
            `Successfully seeded ${creditMappings.length} stripe subscription credit mappings`,
        );
    } catch (error) {
        console.error('Error seeding stripe subscription credits:', error);
        throw error;
    }
};
