import { UserCredits } from '../../schemas';

/**
 * available bucket types for rate limiting
 * each represents a different rate-limited action
 */
export type UserCreditsBucket = keyof UserCredits;
