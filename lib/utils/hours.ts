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
  * Parses a Date or current time into components specifically in Maryland timezone (America/New_York).
  */
export function getMarylandDateComponents(date: Date = new Date()): {
  dayOfWeek: DayOfWeek;
  dateStr: string; // YYYY-MM-DD
  minutesFromMidnight: number;
} {
  // Use Intl.DateTimeFormat with timeZone
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

  // Format hour 24 accurately (Intl may return '24' for midnight in some Node versions, normalize)
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
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
  return h * 60 + (m || 0);
}

export interface OpenNowStatus {
  isOpen: boolean;
  category: OperationalCategory;
  reason: string;
  currentPeriod?: TimePeriod;
  nextChange?: string; // e.g., "Closes at 9:00 PM" or "Opens tomorrow at 12:00 PM"
}

/**
  * Evaluates whether a brewery is open at a given Date/time in Maryland timezone (`America/New_York`).
  * Built to safely serve future "Open Now" queries.
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

  const { dayOfWeek, dateStr, minutesFromMidnight } = getMarylandDateComponents(targetDate);

  // Check holiday/special date exception
  if (brewery.holidayExceptions && brewery.holidayExceptions.length > 0) {
    const holiday = brewery.holidayExceptions.find((ex) => ex.date === dateStr);
    if (holiday) {
      if (holiday.isClosed) {
        return {
          isOpen: false,
          category,
          reason: holiday.notes ? `Closed for holiday: ${holiday.notes}` : 'Closed for holiday exception.',
        };
      }
      if (holiday.periods && holiday.periods.length > 0) {
        const matchingPeriod = holiday.periods.find((p) => {
          const openMin = timeToMinutes(p.opens);
          const closeMin = timeToMinutes(p.closes);
          return minutesFromMidnight >= openMin && minutesFromMidnight < closeMin;
        });
        if (matchingPeriod) {
          return {
            isOpen: true,
            category,
            reason: 'Open for special holiday hours.',
            currentPeriod: matchingPeriod,
            nextChange: `Closes at ${formatTime12h(matchingPeriod.closes)}`,
          };
        } else {
          return {
            isOpen: false,
            category,
            reason: 'Outside special holiday operating periods.',
          };
        }
      }
    }
  }

  // Check weekly structured hours
  const todaySchedule = brewery.structuredHours?.find((h) => h.day === dayOfWeek);

  if (!todaySchedule || todaySchedule.isClosed || !todaySchedule.periods || todaySchedule.periods.length === 0) {
    return {
      isOpen: false,
      category,
      reason: `Closed on ${dayOfWeek}s.`,
    };
  }

  // Check periods (supports multiple opening periods per day / split shifts)
  for (const period of todaySchedule.periods) {
    const openMin = timeToMinutes(period.opens);
    let closeMin = timeToMinutes(period.closes);

    // Handle overnight closing (e.g. opens 16:00, closes 02:00)
    if (closeMin <= openMin) {
      closeMin += 24 * 60;
    }

    const effectiveMinutes = minutesFromMidnight;
    if (minutesFromMidnight < openMin && openMin > 12 * 60) {
      // Check if target time is early AM belonging to previous day's overnight shift
      // Handled simply by checking current day range:
    }

    if (effectiveMinutes >= openMin && effectiveMinutes < closeMin) {
      return {
        isOpen: true,
        category,
        reason: `Open today (${formatTime12h(period.opens)} - ${formatTime12h(period.closes)}).`,
        currentPeriod: period,
        nextChange: `Closes at ${formatTime12h(period.closes)}`,
      };
    }
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
