import { Brewery, BreweryOperatingStatus, DailyHours, TimePeriod, DayOfWeek, OperationalCategory } from '../types';

export const MARYLAND_TIMEZONE = 'America/New_York';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * Gets the previous day of the week.
 */
export function getPreviousDayOfWeek(day: DayOfWeek): DayOfWeek {
  const index = DAYS_OF_WEEK.indexOf(day);
  return DAYS_OF_WEEK[(index + 6) % 7];
}

/**
  * Categorizes brewery operational status into 4 distinct canonical states:
  * - permanently_closed ('Closed' | 'Permanently closed')
  * - temporarily_closed ('Temporarily closed' | 'Seasonal' | 'Opening soon' | 'Relocating' | 'Contract-only')
  * - hours_unavailable ('Open' but missing structured/standard hours)
  * - open ('Open' with valid hours data)
  */
export function getOperationalCategory(
  status: BreweryOperatingStatus,
  structuredHours?: DailyHours[] | null
): OperationalCategory {
  if (status === 'Closed' || status === 'Permanently closed') {
    return 'permanently_closed';
  }

  if (
    status === 'Temporarily closed' ||
    status === 'Seasonal' ||
    status === 'Opening soon' ||
    status === 'Relocating' ||
    status === 'Contract-only'
  ) {
    return 'temporarily_closed';
  }

  if (status === 'Open') {
    if (!structuredHours || structuredHours.length === 0) {
      return 'hours_unavailable';
    }
    return 'open';
  }

  return 'hours_unavailable';
}

/**
  * Formats a 24-hour time string "HH:MM" (e.g., "16:00") into a human-readable 12-hour string ("4:00 PM").
  */
export function formatTime12h(timeStr: string): string {
  if (!timeStr || !timeStr.includes(':')) return timeStr;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return timeStr;

  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minuteStr = m < 10 ? `0${m}` : `${m}`;
  return `${hour12}:${minuteStr} ${ampm}`;
}

/**
  * Formats an array of TimePeriod objects into a single display string.
  * Handles multiple daily periods (e.g. split shifts: 11:00 AM - 2:00 PM, 5:00 PM - 10:00 PM).
  */
export function formatPeriods(periods?: TimePeriod[] | null): string {
  if (!periods || periods.length === 0) return 'Closed';

  return periods
    .map((p) => `${formatTime12h(p.opens)} - ${formatTime12h(p.closes)}`)
    .join(', ');
}

/**
  * Parses a Date into components specifically in Maryland timezone (America/New_York).
  */
export function getMarylandDateComponents(date: Date = new Date()): {
  dayOfWeek: DayOfWeek;
  dateStr: string; // YYYY-MM-DD
  minutesFromMidnight: number;
} {
  const dtfDate = new Intl.DateTimeFormat('en-US', {
    timeZone: MARYLAND_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = dtfDate.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  const dayOfWeek = partMap.weekday as DayOfWeek;
  const dateStr = `${partMap.year}-${partMap.month}-${partMap.day}`;

  let hour = parseInt(partMap.hour, 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(partMap.minute, 10);
  const minutesFromMidnight = hour * 60 + minute;

  return { dayOfWeek, dateStr, minutesFromMidnight };
}

/**
  * Converts "HH:MM" to minutes from midnight (0 to 1439).
  */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

export interface OpenNowStatus {
  isOpen: boolean;
  category: OperationalCategory;
  reason: string;
  currentPeriod?: TimePeriod;
  nextChange?: string; // e.g., "Closes at 9:00 PM"
}

/**
  * Evaluates whether a brewery is open at a given Date/time in Maryland timezone (`America/New_York`).
  * Reused throughout the application for reliable status calculation.
  */
export function isBreweryOpenNow(brewery: Brewery, targetDate: Date = new Date()): OpenNowStatus {
  const category = getOperationalCategory(brewery.status, brewery.structuredHours);

  if (category === 'permanently_closed') {
    return {
      isOpen: false,
      category,
      reason: `Brewery is permanently closed (${brewery.status}).`,
    };
  }

  if (category === 'temporarily_closed') {
    return {
      isOpen: false,
      category,
      reason: `Brewery is temporarily unavailable (${brewery.status}).`,
    };
  }

  if (category === 'hours_unavailable') {
    return {
      isOpen: false,
      category,
      reason: 'Structured operating hours are not available.',
    };
  }

  // Current date components in MD timezone
  const { dayOfWeek, dateStr, minutesFromMidnight } = getMarylandDateComponents(targetDate);

  // 1. Check today's holiday exception first
  if (brewery.holidayExceptions && brewery.holidayExceptions.length > 0) {
    const todayHoliday = brewery.holidayExceptions.find((ex) => ex.date === dateStr);
    if (todayHoliday) {
      if (todayHoliday.isClosed) {
        return {
          isOpen: false,
          category,
          reason: todayHoliday.notes ? `Closed for holiday: ${todayHoliday.notes}` : 'Closed for holiday exception.',
        };
      }
      if (todayHoliday.periods && todayHoliday.periods.length > 0) {
        for (const period of todayHoliday.periods) {
          const openMin = timeToMinutes(period.opens);
          let closeMin = timeToMinutes(period.closes);
          if (closeMin <= openMin) {
            closeMin += 24 * 60;
          }
          if (minutesFromMidnight >= openMin && minutesFromMidnight < closeMin) {
            return {
              isOpen: true,
              category,
              reason: 'Open for special holiday hours.',
              currentPeriod: period,
              nextChange: `Closes at ${formatTime12h(period.closes)}`,
            };
          }
        }
        return {
          isOpen: false,
          category,
          reason: 'Outside special holiday operating periods.',
        };
      }
    }
  }

  // 2. Check today's weekly structured schedule
  const todaySchedule = brewery.structuredHours?.find((h) => h.day === dayOfWeek);
  if (todaySchedule && !todaySchedule.isClosed && todaySchedule.periods && todaySchedule.periods.length > 0) {
    for (const period of todaySchedule.periods) {
      const openMin = timeToMinutes(period.opens);
      let closeMin = timeToMinutes(period.closes);

      // Handle overnight shift starting today and ending tomorrow (e.g., 16:00 to 02:00)
      if (closeMin <= openMin) {
        closeMin += 24 * 60;
      }

      if (minutesFromMidnight >= openMin && minutesFromMidnight < closeMin) {
        return {
          isOpen: true,
          category,
          reason: `Open today (${formatTime12h(period.opens)} - ${formatTime12h(period.closes)}).`,
          currentPeriod: period,
          nextChange: `Closes at ${formatTime12h(period.closes)}`,
        };
      }
    }
  }

  // 3. Check if target time falls within an overnight shift from YESTERDAY
  const prevTargetDate = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000);
  const prevComponents = getMarylandDateComponents(prevTargetDate);
  const prevDayOfWeek = prevComponents.dayOfWeek;
  const prevDateStr = prevComponents.dateStr;
  const targetMinutesFromPrevMidnight = minutesFromMidnight + 24 * 60;

  // Check yesterday's holiday exception if any
  if (brewery.holidayExceptions && brewery.holidayExceptions.length > 0) {
    const prevHoliday = brewery.holidayExceptions.find((ex) => ex.date === prevDateStr);
    if (prevHoliday && !prevHoliday.isClosed && prevHoliday.periods && prevHoliday.periods.length > 0) {
      for (const period of prevHoliday.periods) {
        const openMin = timeToMinutes(period.opens);
        let closeMin = timeToMinutes(period.closes);
        if (closeMin <= openMin) {
          closeMin += 24 * 60;
          if (targetMinutesFromPrevMidnight >= openMin && targetMinutesFromPrevMidnight < closeMin) {
            return {
              isOpen: true,
              category,
              reason: 'Open for special holiday hours (overnight shift).',
              currentPeriod: period,
              nextChange: `Closes at ${formatTime12h(period.closes)}`,
            };
          }
        }
      }
    }
  }

  // Check yesterday's regular weekly schedule
  const prevSchedule = brewery.structuredHours?.find((h) => h.day === prevDayOfWeek);
  if (prevSchedule && !prevSchedule.isClosed && prevSchedule.periods && prevSchedule.periods.length > 0) {
    for (const period of prevSchedule.periods) {
      const openMin = timeToMinutes(period.opens);
      let closeMin = timeToMinutes(period.closes);
      if (closeMin <= openMin) {
        closeMin += 24 * 60;
        if (targetMinutesFromPrevMidnight >= openMin && targetMinutesFromPrevMidnight < closeMin) {
          return {
            isOpen: true,
            category,
            reason: `Open today late night shift (${formatTime12h(period.opens)} - ${formatTime12h(period.closes)}).`,
            currentPeriod: period,
            nextChange: `Closes at ${formatTime12h(period.closes)}`,
          };
        }
      }
    }
  }

  // 4. Default closed response if no shift matches
  if (!todaySchedule || todaySchedule.isClosed || !todaySchedule.periods || todaySchedule.periods.length === 0) {
    return {
      isOpen: false,
      category,
      reason: `Closed on ${dayOfWeek}s.`,
    };
  }

  return {
    isOpen: false,
    category,
    reason: `Closed currently on ${dayOfWeek}.`,
  };
}

/**
  * Normalizes and orders structured weekly hours to always present Monday -> Sunday consistently.
  */
export function getOrderedWeeklyHours(structuredHours?: DailyHours[] | null): DailyHours[] {
  if (!structuredHours) return [];

  const hoursMap = new Map<DayOfWeek, DailyHours>();
  for (const item of structuredHours) {
    hoursMap.set(item.day as DayOfWeek, item);
  }

  return DAYS_OF_WEEK.map((day) => {
    if (hoursMap.has(day)) {
      return hoursMap.get(day)!;
    }
    return {
      day,
      isClosed: true,
      periods: [],
    };
  });
}
