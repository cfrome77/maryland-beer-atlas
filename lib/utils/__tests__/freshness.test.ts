import { describe, it, expect } from 'vitest';
import { getDataFreshnessInfo } from '../freshness';
import { Brewery } from '../../types';

describe('Data Freshness Utility', () => {
  const referenceDate = new Date('2025-07-01T00:00:00.000Z');

  it('categorizes brewery verified within 90 days as fresh', () => {
    const brewery: Partial<Brewery> = {
      lastVerified: '2025-06-15', // 16 days ago relative to 2025-07-01
      verificationStatus: 'Verified',
      verificationSource: 'Official Website',
    };

    const result = getDataFreshnessInfo(brewery, referenceDate);
    expect(result.isStale).toBe(false);
    expect(result.freshnessCategory).toBe('fresh');
    expect(result.daysSinceVerified).toBe(16);
    expect(result.verificationBadge.label).toBe('Recently Verified');
    expect(result.freshnessSummary).toContain('Verified 16 days ago via Official Website');
  });

  it('categorizes brewery verified between 91 and 180 days as stale', () => {
    const brewery: Partial<Brewery> = {
      lastVerified: '2025-02-15', // ~136 days ago
      verificationStatus: 'Verified',
      verificationSource: 'Official Website',
    };

    const result = getDataFreshnessInfo(brewery, referenceDate);
    expect(result.isStale).toBe(true);
    expect(result.freshnessCategory).toBe('stale');
    expect(result.verificationBadge.label).toBe('Stale Data');
    expect(result.freshnessSummary).toContain('Last verified 136 days ago');
  });

  it('categorizes brewery verified over 180 days ago as outdated', () => {
    const brewery: Partial<Brewery> = {
      lastVerified: '2024-11-01', // > 180 days ago
      verificationStatus: 'Verified',
      verificationSource: 'Official Website',
    };

    const result = getDataFreshnessInfo(brewery, referenceDate);
    expect(result.isStale).toBe(true);
    expect(result.freshnessCategory).toBe('outdated');
    expect(result.verificationBadge.label).toBe('Outdated Verification');
    expect(result.freshnessSummary).toContain('Last confirmed over 6 months ago');
  });

  it('categorizes status "Needs Review" as outdated regardless of date', () => {
    const brewery: Partial<Brewery> = {
      lastVerified: '2025-06-30', // 1 day ago
      verificationStatus: 'Needs Review',
      verificationSource: 'Community Alert',
    };

    const result = getDataFreshnessInfo(brewery, referenceDate);
    expect(result.isStale).toBe(true);
    expect(result.freshnessCategory).toBe('outdated');
    expect(result.verificationBadge.label).toBe('Needs Review');
    expect(result.freshnessSummary).toContain('Data flagged for review');
  });

  it('handles missing or unparseable lastVerified date safely', () => {
    const brewery: Partial<Brewery> = {
      lastVerified: '',
      verificationStatus: 'Community Submitted',
    };

    const result = getDataFreshnessInfo(brewery, referenceDate);
    expect(result.isStale).toBe(true);
    expect(result.freshnessCategory).toBe('unverified');
    expect(result.daysSinceVerified).toBeNull();
    expect(result.freshnessSummary).toContain('No verified date available');
  });
});
