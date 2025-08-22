import { UserCredits } from '../../../bases/credits/user/schemas';

/**
 * Plan-based credit limits
 * Defines how many credits each subscription plan provides
 */
export const planCreditsMax: Record<string, UserCredits> = {
    // Individual plans
    price_individual_monthly: { generateNotes: 30 },
    price_individual_yearly: { generateNotes: 30 },

    // Pro plans
    price_pro_monthly: { generateNotes: 60 },
    price_pro_yearly: { generateNotes: 60 },

    // Team plans
    price_team_monthly: { generateNotes: 200 },
    price_team_yearly: { generateNotes: 200 },

    // Default for free tier
    default: { generateNotes: 10 },
};
