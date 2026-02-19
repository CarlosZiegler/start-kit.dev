/**
 * Centralized query configuration constants
 * Use these to ensure consistent behavior across all queries
 */

/**
 * Stale times for different query types (in milliseconds)
 */
export const QUERY_STALE_TIMES = {
  /** Organization invitations - 30 seconds */
  ORGANIZATION_INVITATIONS: 30_000,
  /** Organization members - 15 seconds */
  ORGANIZATION_MEMBERS: 15_000,
  /** Active member role - 15 seconds */
  ACTIVE_MEMBER: 15_000,
  /** User session - 1 minute */
  SESSION: 60_000,
  /** Subscription data - 5 minutes */
  SUBSCRIPTION: 300_000,
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
  /** Default page size */
  PAGE_SIZE: 10,
  /** Default starting page (1-indexed) */
  INITIAL_PAGE: 1,
} as const;

/**
 * Query retry configuration
 */
export const QUERY_RETRY_CONFIG = {
  /** Default retry count for failed queries */
  DEFAULT_RETRIES: 3,
  /** Retry count for authentication queries */
  AUTH_RETRIES: 1,
  /** No retries for specific queries */
  NO_RETRY: 0,
} as const;
