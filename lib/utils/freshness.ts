import { Brewery, VerificationStatus } from '../types';

export const FRESH_THRESHOLD_DAYS = 90;
export const STALE_THRESHOLD_DAYS = 180;

export type FreshnessCategory = 'fresh' | 'stale' | 'outdated' | 'unverified';

export interface VerificationBadgeInfo {
  label: string;
  variant: 'verified' | 'stale' | 'needs_review' | 'community';
  colorClass: string;
}

export interface DataFreshnessInfo {
  isStale: boolean;
  freshnessCategory: FreshnessCategory;
  daysSinceVerified: number | null;
  verificationBadge: VerificationBadgeInfo;
  freshnessSummary: string;
}

/**
 * Parses a YYYY-MM-DD date string safely into a Date object at midnight local time.
 */
function parseDateString(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
}

/**
 * Evaluates brewery data freshness and verification metadata against standard thresholds.
 *
 * Rules:
 * - Fresh: Verified within FRESH_THRESHOLD_DAYS (<= 90 days) and status is 'Verified'.
 * - Stale: Verified between FRESH_THRESHOLD_DAYS (91 days) and STALE_THRESHOLD_DAYS (180 days).
 * - Outdated: Verification is older than STALE_THRESHOLD_DAYS (> 180 days) OR status is 'Needs Review'.
 * - Unverified: Data status is 'Community Submitted' without direct verification or lacks valid verification date.
 */
export function getDataFreshnessInfo(
  brewery: Partial<Brewery>,
  targetDate: Date = new Date()
): DataFreshnessInfo {
  const verifiedDate = parseDateString(brewery.lastVerified);
  const status: VerificationStatus = brewery.verificationStatus || 'Community Submitted';

  let daysSinceVerified: number | null = null;

  if (verifiedDate) {
    const targetMidnight = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    const diffTime = targetMidnight.getTime() - verifiedDate.getTime();
    daysSinceVerified = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  // 1. Check for 'Needs Review' status
  if (status === 'Needs Review') {
    return {
      isStale: true,
      freshnessCategory: 'outdated',
      daysSinceVerified,
      verificationBadge: {
        label: 'Needs Review',
        variant: 'needs_review',
        colorClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      },
      freshnessSummary:
        brewery.verificationSource
          ? `Data flagged for review (Source: ${brewery.verificationSource}). Re-verification recommended before visiting.`
          : 'Data flagged for review. Re-verification recommended before visiting.',
    };
  }

  // 2. Check for missing or unverified date
  if (daysSinceVerified === null) {
    return {
      isStale: true,
      freshnessCategory: 'unverified',
      daysSinceVerified: null,
      verificationBadge: {
        label: status === 'Community Submitted' ? 'Community Submitted' : 'Unverified Data',
        variant: status === 'Community Submitted' ? 'community' : 'stale',
        colorClass: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30',
      },
      freshnessSummary: 'No verified date available. Details have not been independently confirmed recently.',
    };
  }

  // 3. Category based on days since last verification
  if (status === 'Verified' && daysSinceVerified <= FRESH_THRESHOLD_DAYS) {
    return {
      isStale: false,
      freshnessCategory: 'fresh',
      daysSinceVerified,
      verificationBadge: {
        label: 'Recently Verified',
        variant: 'verified',
        colorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      },
      freshnessSummary: `Verified ${daysSinceVerified === 0 ? 'today' : `${daysSinceVerified} day${daysSinceVerified === 1 ? '' : 's'} ago`} via ${
        brewery.verificationSource || 'Official Source'
      }.`,
    };
  }

  if (daysSinceVerified <= STALE_THRESHOLD_DAYS) {
    return {
      isStale: true,
      freshnessCategory: 'stale',
      daysSinceVerified,
      verificationBadge: {
        label: status === 'Community Submitted' ? 'Community Submitted (Stale)' : 'Stale Data',
        variant: status === 'Community Submitted' ? 'community' : 'stale',
        colorClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      },
      freshnessSummary: `Last verified ${daysSinceVerified} days ago (${brewery.lastVerified}). Operating details may have changed.`,
    };
  }

  // > STALE_THRESHOLD_DAYS (> 180 days)
  return {
    isStale: true,
    freshnessCategory: 'outdated',
    daysSinceVerified,
    verificationBadge: {
      label: 'Outdated Verification',
      variant: 'stale',
      colorClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
    },
    freshnessSummary: `Last confirmed over 6 months ago (${brewery.lastVerified}). Data should be re-verified with brewery official channels.`,
  };
}
