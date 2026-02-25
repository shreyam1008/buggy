/**
 * Nepali (BS) ↔ English (AD) Date Conversion Utilities
 */
import { bsMonthData, newYearMap, BS_MIN_YEAR, BS_MAX_YEAR } from '../data/nepaliCalendar';

export interface BsDate {
  year: number;
  month: number; // 0-indexed (0 = Baishakh)
  day: number;   // 1-indexed
}

/** Get the number of days in a BS month */
export function getDaysInBsMonth(year: number, month: number): number {
  const data = bsMonthData[year];
  if (!data) return 30;
  return data[month] ?? 30;
}

/** Get total days in a BS year */
function getTotalDaysInBsYear(year: number): number {
  const data = bsMonthData[year];
  if (!data) return 365;
  return data.reduce((a, b) => a + b, 0);
}

/** Convert BS date to AD Date object */
export function bsToAd(bsYear: number, bsMonth: number, bsDay: number): Date {
  const nyData = newYearMap[bsYear];
  if (!nyData) {
    return new Date(); // fallback
  }

  const startAd = new Date(nyData[0], nyData[1], nyData[2]);

  let daysToAdd = 0;
  for (let i = 0; i < bsMonth; i++) {
    daysToAdd += getDaysInBsMonth(bsYear, i);
  }
  daysToAdd += (bsDay - 1);

  const result = new Date(startAd);
  result.setDate(result.getDate() + daysToAdd);
  return result;
}

/** Convert AD Date to BS date */
export function adToBs(adDate: Date): BsDate {
  const target = new Date(adDate.getFullYear(), adDate.getMonth(), adDate.getDate());

  for (let bsY = BS_MAX_YEAR; bsY >= BS_MIN_YEAR; bsY--) {
    const nyData = newYearMap[bsY];
    if (!nyData) continue;

    const yearStart = new Date(nyData[0], nyData[1], nyData[2]);
    if (target < yearStart) continue;

    // target >= yearStart, so this is the BS year (or later month spills over)
    let diffDays = Math.round((target.getTime() - yearStart.getTime()) / 86400000);

    const monthData = bsMonthData[bsY];
    if (!monthData) continue;

    const totalDays = getTotalDaysInBsYear(bsY);
    if (diffDays >= totalDays) continue; // belongs to next year

    for (let m = 0; m < 12; m++) {
      if (diffDays < monthData[m]) {
        return { year: bsY, month: m, day: diffDays + 1 };
      }
      diffDays -= monthData[m];
    }
  }

  // Fallback — shouldn't happen within range
  return { year: 2082, month: 0, day: 1 };
}

/** Get today's date in BS */
export function getTodayBs(): BsDate {
  return adToBs(new Date());
}

/**
 * Get the day-of-week (0=Sun…6=Sat) for the 1st day of a BS month.
 */
export function getStartDayOfWeek(bsYear: number, bsMonth: number): number {
  const adDate = bsToAd(bsYear, bsMonth, 1);
  return adDate.getDay();
}

/** Navigate to previous BS month */
export function getPrevMonth(year: number, month: number): { year: number; month: number } {
  if (month === 0) return { year: year - 1, month: 11 };
  return { year, month: month - 1 };
}

/** Navigate to next BS month */
export function getNextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 11) return { year: year + 1, month: 0 };
  return { year, month: month + 1 };
}

