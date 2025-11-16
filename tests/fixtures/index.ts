/**
 * Test fixtures index
 * Re-export all fixtures from a single location
 */

export * from './users';
export * from './books';

// Fine calculation constants (matching business logic)
export const FINE_RATE_PER_DAY = 0.5; // $0.50 per day
export const DEFAULT_LOAN_PERIOD_DAYS = 30;
export const RENEWAL_EXTENSION_DAYS = 14;

// Membership tier limits
export const MEMBERSHIP_LIMITS = {
  standard: {
    borrowingLimit: 5,
    renewalLimit: 2,
  },
  premium: {
    borrowingLimit: 15,
    renewalLimit: 5,
  },
  student: {
    borrowingLimit: 10,
    renewalLimit: 3,
  },
};
