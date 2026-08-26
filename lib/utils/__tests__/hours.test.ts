import { describe, it, expect } from 'vitest';
import {
  getOperationalCategory,
  formatTime12h,
  formatPeriods,
  getMarylandDateComponents,
  isBreweryOpenNow,
  getOrderedWeeklyHours,
} from '../hours';
import { Brewery } from '../../types';

const baseBrewery: Brewery = {
  id: 'test-brewery',
  slug: 'test-brewery',
  name: 'Test Brewery',
  type: 'Microbrewery',
  region: 'Central',
  status: 'Open',
  address: '123 Main St',
  city: 'Baltimore',
  county: 'Baltimore City',
  state: 'MD',
  zipCode: '21201',
  phone: '410-555-0100',
  website: 'https://example.com',
  socialLinks: {},
  coordinates: { lat: 39.29, lng: -76.61 },
  description: 'A test brewery',
  image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
  hours: [{ day: 'Monday', hours: '12:00 PM - 8:00 PM' }],
  structuredHours: [
    { day: 'Monday', isClosed: false, periods: [{ opens: '12:00', closes: '20:00' }] },
    { day: 'Tuesday', isClosed: false, periods: [{ opens: '11:30', closes: '14:00' }, { opens: '17:00', closes: '21:30' }] },
    { day: 'Wednesday', isClosed: true, periods: [] },
  ],
  beerStyles: ['IPA'],
  amenities: ['Patio'],
  featured: false,
  lastVerified: '2025-06-01',
  verificationSource: 'Official Website',
  verificationStatus: 'Verified',
};

describe('Hours and Operational Status Utility', () => {
  describe('getOperationalCategory', () => {
    it('categorizes permanently closed status correctly', () => {
      expect(getOperationalCategory('Closed', baseBrewery.structuredHours)).toBe('permanently_closed');
      expect(getOperationalCategory('Permanently closed', baseBrewery.structuredHours)).toBe('permanently_closed');
    });

    it('categorizes temporarily closed statuses correctly', () => {
      expect(getOperationalCategory('Temporarily closed')).toBe('temporarily_closed');
      expect(getOperationalCategory('Seasonal')).toBe('temporarily_closed');
      expect(getOperationalCategory('Opening soon')).toBe('temporarily_closed');
      expect(getOperationalCategory('Relocating')).toBe('temporarily_closed');
      expect(getOperationalCategory('Contract-only')).toBe('temporarily_closed');
    });

    it('categorizes open breweries with structured hours as open', () => {
      expect(getOperationalCategory('Open', baseBrewery.structuredHours)).toBe('open');
    });

    it('categorizes open breweries without structured hours as hours_unavailable', () => {
      expect(getOperationalCategory('Open', [])).toBe('hours_unavailable');
      expect(getOperationalCategory('Open', null)).toBe('hours_unavailable');
    });
  });

  describe('Formatting Helpers', () => {
    it('formats 24-hour time string into 12-hour format cleanly', () => {
      expect(formatTime12h('09:00')).toBe('9:00 AM');
      expect(formatTime12h('12:00')).toBe('12:00 PM');
      expect(formatTime12h('16:30')).toBe('4:30 PM');
      expect(formatTime12h('00:00')).toBe('12:00 AM');
      expect(formatTime12h('23:59')).toBe('11:59 PM');
    });

    it('formats multi-period opening shifts correctly', () => {
      const periods = [
        { opens: '11:30', closes: '14:00' },
        { opens: '17:00', closes: '21:30' },
      ];
      expect(formatPeriods(periods)).toBe('11:30 AM - 2:00 PM, 5:00 PM - 9:30 PM');
      expect(formatPeriods([])).toBe('Closed');
      expect(formatPeriods(null)).toBe('Closed');
    });
  });

  describe('Maryland Timezone Components', () => {
    it('evaluates date components specifically for America/New_York timezone', () => {
      // 2025-06-16 19:00:00 UTC = 2025-06-16 15:00:00 EDT (Monday)
      const targetUtc = new Date('2025-06-16T19:00:00Z');
      const comp = getMarylandDateComponents(targetUtc);
      expect(comp.dayOfWeek).toBe('Monday');
      expect(comp.dateStr).toBe('2025-06-16');
      expect(comp.minutesFromMidnight).toBe(15 * 60); // 15:00
    });
  });

  describe('isBreweryOpenNow', () => {
    it('returns isOpen: false for permanently closed breweries', () => {
      const closedBrewery: Brewery = { ...baseBrewery, status: 'Permanently closed' };
      const status = isBreweryOpenNow(closedBrewery);
      expect(status.isOpen).toBe(false);
      expect(status.category).toBe('permanently_closed');
    });

    it('returns isOpen: false for temporarily closed breweries', () => {
      const tempClosedBrewery: Brewery = { ...baseBrewery, status: 'Temporarily closed' };
      const status = isBreweryOpenNow(tempClosedBrewery);
      expect(status.isOpen).toBe(false);
      expect(status.category).toBe('temporarily_closed');
    });

    it('returns isOpen: false for open status with missing structured hours', () => {
      const noHoursBrewery: Brewery = { ...baseBrewery, structuredHours: [] };
      const status = isBreweryOpenNow(noHoursBrewery);
      expect(status.isOpen).toBe(false);
      expect(status.category).toBe('hours_unavailable');
    });

    it('accurately evaluates open window vs closed window on a given day', () => {
      // Monday 15:00 EDT -> Open (hours 12:00 - 20:00)
      const mondayAfternoon = new Date('2025-06-16T19:00:00Z'); // 15:00 EDT
      const openResult = isBreweryOpenNow(baseBrewery, mondayAfternoon);
      expect(openResult.isOpen).toBe(true);
      expect(openResult.category).toBe('open');
      expect(openResult.nextChange).toBe('Closes at 8:00 PM');

      // Monday 21:00 EDT -> Closed
      const mondayNight = new Date('2025-06-17T01:00:00Z'); // 21:00 EDT
      const closedResult = isBreweryOpenNow(baseBrewery, mondayNight);
      expect(closedResult.isOpen).toBe(false);
    });

    it('handles multi-period split shifts correctly', () => {
      // Tuesday split shift: 11:30 - 14:00 and 17:00 - 21:30
      // Tuesday 13:00 EDT -> Open during lunch shift
      const tuesdayLunch = new Date('2025-06-17T17:00:00Z'); // 13:00 EDT
      expect(isBreweryOpenNow(baseBrewery, tuesdayLunch).isOpen).toBe(true);

      // Tuesday 15:00 EDT -> Closed between shifts
      const tuesdayBreak = new Date('2025-06-17T19:00:00Z'); // 15:00 EDT
      expect(isBreweryOpenNow(baseBrewery, tuesdayBreak).isOpen).toBe(false);

      // Tuesday 18:00 EDT -> Open during dinner shift
      const tuesdayDinner = new Date('2025-06-17T22:00:00Z'); // 18:00 EDT
      expect(isBreweryOpenNow(baseBrewery, tuesdayDinner).isOpen).toBe(true);
    });

    it('handles explicit closed day correctly', () => {
      // Wednesday is closed
      const wednesdayTime = new Date('2025-06-18T18:00:00Z'); // 14:00 EDT
      const result = isBreweryOpenNow(baseBrewery, wednesdayTime);
      expect(result.isOpen).toBe(false);
      expect(result.reason).toContain('Closed on Wednesdays');
    });

    it('respects holiday exceptions', () => {
      const holidayBrewery: Brewery = {
        ...baseBrewery,
        holidayExceptions: [
          { date: '2025-12-25', isClosed: true, notes: 'Christmas' },
        ],
      };
      // Christmas Day in EDT/EST
      const christmasDay = new Date('2025-12-25T17:00:00Z');
      const result = isBreweryOpenNow(holidayBrewery, christmasDay);
      expect(result.isOpen).toBe(false);
      expect(result.reason).toContain('Christmas');
    });
  });

  describe('getOrderedWeeklyHours', () => {
    it('returns a full 7-day schedule ordered Monday through Sunday', () => {
      const ordered = getOrderedWeeklyHours(baseBrewery.structuredHours);
      expect(ordered.length).toBe(7);
      expect(ordered.map((h) => h.day)).toEqual([
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ]);
      expect(ordered[0].isClosed).toBe(false);
      expect(ordered[2].isClosed).toBe(true);
      expect(ordered[3].isClosed).toBe(true); // default filled closed day
    });
  });
});
