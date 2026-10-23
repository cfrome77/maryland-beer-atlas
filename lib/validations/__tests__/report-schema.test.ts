import { describe, it, expect } from 'vitest';
import { safeValidateBreweryReport } from '../schemas';

describe('Brewery Report Zod Validation Schema', () => {
  const validReport = {
    breweryId: 'flying-dog-brewery',
    brewerySlug: 'flying-dog-brewery',
    breweryName: 'Flying Dog Brewery',
    reportType: 'hours_change' as const,
    details: 'New Sunday hours: 12 PM - 7 PM starting next month.',
    reporterName: 'John Doe',
    reporterEmail: 'john@example.com',
  };

  it('validates a correct brewery report submission', () => {
    const result = safeValidateBreweryReport(validReport);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.breweryId).toBe('flying-dog-brewery');
      expect(result.data.reportType).toBe('hours_change');
      expect(result.data.details).toBe('New Sunday hours: 12 PM - 7 PM starting next month.');
    }
  });

  it('allows optional reporter name and email to be omitted or empty', () => {
    const minimalReport = {
      breweryId: 'flying-dog-brewery',
      brewerySlug: 'flying-dog-brewery',
      breweryName: 'Flying Dog Brewery',
      reportType: 'closure_notice' as const,
      details: 'Temporarily closed for taproom renovations.',
    };

    const result = safeValidateBreweryReport(minimalReport);
    expect(result.success).toBe(true);
  });

  it('rejects submissions with details under 5 characters', () => {
    const shortReport = {
      ...validReport,
      details: 'Soon',
    };

    const result = safeValidateBreweryReport(shortReport);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.formattedError).toContain('Please provide details with at least 5 characters');
    }
  });

  it('rejects invalid email formats when email is provided', () => {
    const invalidEmailReport = {
      ...validReport,
      reporterEmail: 'not-an-email',
    };

    const result = safeValidateBreweryReport(invalidEmailReport);
    expect(result.success).toBe(false);
  });

  it('rejects invalid report type', () => {
    const invalidTypeReport = {
      ...validReport,
      reportType: 'invalid_category',
    };

    const result = safeValidateBreweryReport(invalidTypeReport);
    expect(result.success).toBe(false);
  });
});
