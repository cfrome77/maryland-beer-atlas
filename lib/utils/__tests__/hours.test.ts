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
    { day: 'Friday', isClosed: false, periods: [{ opens: '16:00', closes: '02:00' }] },
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
    it('evaluates date components specifically for America/New_York timezone in Daylight Saving Time (EDT)', () => {
      // 2025-06-16 19:00:00 UTC = 2025-06-16 15:00:00 EDT (Monday)
      const targetUtc = new Date('2025-06-16T19:00:00Z');
      const comp = getMarylandDateComponents(targetUtc);
      expect(comp.dayOfWeek).toBe('Monday');
      expect(comp.dateStr).toBe('2025-06-16');
      expect(comp.minutesFromMidnight).toBe(15 * 60); // 15:00 EDT
    });

    it('evaluates date components specifically for America/New_York timezone in Standard Time (EST)', () => {
      // 2025-01-15 19:00:00 UTC = 2025-01-15 14:00:00 EST (Wednesday)
      const targetUtc = new Date('2025-01-15T19:00:00Z');
      const comp = getMarylandDateComponents(targetUtc);
      expect(comp.dayOfWeek).toBe('Wednesday');
      expect(comp.dateStr).toBe('2025-01-15');
      expect(comp.minutesFromMidnight).toBe(14 * 60); // 14:00 EST
    });
  });

  describe('isBreweryOpenNow', () => {
    describe('permanently and temporarily closed breweries', () => {
      it('returns isOpen: false for permanently closed breweries', () => {
        const closedBrewery: Brewery = { ...baseBrewery, status: 'Permanently closed' };
        const status = isBreweryOpenNow(closedBrewery);
        expect(status.isOpen).toBe(false);
        expect(status.category).toBe('permanently_closed');
        expect(status.reason).toContain('permanently closed');
      });

      it('returns isOpen: false for temporarily closed breweries', () => {
        const tempClosedStatuses: Brewery['status'][] = ['Temporarily closed', 'Seasonal', 'Opening soon', 'Relocating', 'Contract-only'];
        for (const st of tempClosedStatuses) {
          const tempClosedBrewery: Brewery = { ...baseBrewery, status: st };
          const status = isBreweryOpenNow(tempClosedBrewery);
          expect(status.isOpen).toBe(false);
          expect(status.category).toBe('temporarily_closed');
          expect(status.reason).toContain('temporarily unavailable');
        }
      });
    });

    describe('missing hours', () => {
      it('returns isOpen: false without falsely claiming open or closed when structured hours are missing', () => {
        const noHoursBrewery: Brewery = { ...baseBrewery, structuredHours: [] };
        const status = isBreweryOpenNow(noHoursBrewery);
        expect(status.isOpen).toBe(false);
        expect(status.category).toBe('hours_unavailable');
        expect(status.reason).toBe('Structured operating hours are not available.');
      });

      it('returns isOpen: false when structuredHours is null or undefined', () => {
        const nullHoursBrewery: Brewery = { ...baseBrewery, structuredHours: null };
        const status = isBreweryOpenNow(nullHoursBrewery);
        expect(status.isOpen).toBe(false);
        expect(status.category).toBe('hours_unavailable');
      });
    });

    describe('normal hours', () => {
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

      it('returns closed before opening time', () => {
        // Monday 11:00 EDT -> Closed (opens 12:00)
        const mondayMorning = new Date('2025-06-16T15:00:00Z'); // 11:00 EDT
        const result = isBreweryOpenNow(baseBrewery, mondayMorning);
        expect(result.isOpen).toBe(false);
      });
    });

    describe('closed days', () => {
      it('handles explicit closed day correctly', () => {
        // Wednesday is closed
        const wednesdayTime = new Date('2025-06-18T18:00:00Z'); // 14:00 EDT
        const result = isBreweryOpenNow(baseBrewery, wednesdayTime);
        expect(result.isOpen).toBe(false);
        expect(result.reason).toContain('Closed on Wednesdays');
      });

      it('handles unscheduled days (missing from structuredHours array)', () => {
        // Thursday has no entry in structuredHours
        const thursdayTime = new Date('2025-06-19T18:00:00Z'); // 14:00 EDT
        const result = isBreweryOpenNow(baseBrewery, thursdayTime);
        expect(result.isOpen).toBe(false);
        expect(result.reason).toContain('Closed on Thursdays');
      });
    });

    describe('multiple periods (split shifts)', () => {
      it('handles multi-period split shifts correctly', () => {
        // Tuesday split shift: 11:30 - 14:00 and 17:00 - 21:30
        // Tuesday 13:00 EDT -> Open during lunch shift
        const tuesdayLunch = new Date('2025-06-17T17:00:00Z'); // 13:00 EDT
        const lunchResult = isBreweryOpenNow(baseBrewery, tuesdayLunch);
        expect(lunchResult.isOpen).toBe(true);
        expect(lunchResult.nextChange).toBe('Closes at 2:00 PM');

        // Tuesday 15:00 EDT -> Closed between shifts
        const tuesdayBreak = new Date('2025-06-17T19:00:00Z'); // 15:00 EDT
        expect(isBreweryOpenNow(baseBrewery, tuesdayBreak).isOpen).toBe(false);

        // Tuesday 18:00 EDT -> Open during dinner shift
        const tuesdayDinner = new Date('2025-06-17T22:00:00Z'); // 18:00 EDT
        const dinnerResult = isBreweryOpenNow(baseBrewery, tuesdayDinner);
        expect(dinnerResult.isOpen).toBe(true);
        expect(dinnerResult.nextChange).toBe('Closes at 9:30 PM');

        // Tuesday 22:00 EDT -> Closed after dinner shift
        const tuesdayLate = new Date('2025-06-18T02:00:00Z'); // 22:00 EDT
        expect(isBreweryOpenNow(baseBrewery, tuesdayLate).isOpen).toBe(false);
      });
    });

    describe('boundary times', () => {
      it('treats exact opening time (12:00) as open', () => {
        // Monday opens 12:00. 12:00 EDT = 16:00 UTC
        const exactOpen = new Date('2025-06-16T16:00:00Z');
        expect(isBreweryOpenNow(baseBrewery, exactOpen).isOpen).toBe(true);
      });

      it('treats 1 minute before opening (11:59) as closed', () => {
        const minuteBefore = new Date('2025-06-16T15:59:00Z');
        expect(isBreweryOpenNow(baseBrewery, minuteBefore).isOpen).toBe(false);
      });

      it('treats exact closing time (20:00) as closed', () => {
        // Monday closes 20:00. 20:00 EDT = 2025-06-17 00:00 UTC
        const exactClose = new Date('2025-06-17T00:00:00Z');
        expect(isBreweryOpenNow(baseBrewery, exactClose).isOpen).toBe(false);
      });

      it('treats 1 minute before closing (19:59) as open', () => {
        const minuteBeforeClose = new Date('2025-06-16T23:59:00Z');
        expect(isBreweryOpenNow(baseBrewery, minuteBeforeClose).isOpen).toBe(true);
      });
    });

    describe('overnight shifts', () => {
      it('evaluates overnight opening periods starting today and spilling past midnight', () => {
        // Friday shift: 16:00 - 02:00 (Saturday 2 AM)
        // Friday 23:00 EDT -> Open
        const fridayNight = new Date('2025-06-21T03:00:00Z'); // 23:00 EDT Friday
        const res = isBreweryOpenNow(baseBrewery, fridayNight);
        expect(res.isOpen).toBe(true);
        expect(res.nextChange).toBe('Closes at 2:00 AM');
      });

      it('evaluates overnight shift from YESTERDAY when target time is early Saturday morning', () => {
        // Saturday 01:00 EDT (05:00 UTC Saturday) -> belongs to Friday night shift (16:00 - 02:00)
        const saturdayEarlyAM = new Date('2025-06-21T05:00:00Z'); // 01:00 EDT Saturday
        const res = isBreweryOpenNow(baseBrewery, saturdayEarlyAM);
        expect(res.isOpen).toBe(true);
        expect(res.nextChange).toBe('Closes at 2:00 AM');

        // Saturday 02:30 EDT -> Closed (Friday overnight shift ended at 02:00)
        const saturdayAfterClose = new Date('2025-06-21T06:30:00Z'); // 02:30 EDT Saturday
        expect(isBreweryOpenNow(baseBrewery, saturdayAfterClose).isOpen).toBe(false);
      });
    });

    describe('holiday exceptions', () => {
      it('respects holiday closing exception', () => {
        const holidayBrewery: Brewery = {
          ...baseBrewery,
          holidayExceptions: [
            { date: '2025-12-25', isClosed: true, notes: 'Christmas Day' },
          ],
        };
        const christmasDay = new Date('2025-12-25T17:00:00Z'); // 12:00 EST Dec 25
        const result = isBreweryOpenNow(holidayBrewery, christmasDay);
        expect(result.isOpen).toBe(false);
        expect(result.reason).toContain('Christmas Day');
      });

      it('respects holiday custom operating hours exception', () => {
        const holidayBrewery: Brewery = {
          ...baseBrewery,
          holidayExceptions: [
            { date: '2025-07-04', isClosed: false, periods: [{ opens: '10:00', closes: '14:00' }], notes: 'Independence Day Special Hours' },
          ],
        };
        // July 4th at 11:00 EDT -> Open
        const july4Open = new Date('2025-07-04T15:00:00Z'); // 11:00 EDT
        const openRes = isBreweryOpenNow(holidayBrewery, july4Open);
        expect(openRes.isOpen).toBe(true);
        expect(openRes.reason).toBe('Open for special holiday hours.');

        // July 4th at 16:00 EDT -> Closed
        const july4Closed = new Date('2025-07-04T20:00:00Z'); // 16:00 EDT
        const closedRes = isBreweryOpenNow(holidayBrewery, july4Closed);
        expect(closedRes.isOpen).toBe(false);
        expect(closedRes.reason).toBe('Outside special holiday operating periods.');
      });
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
