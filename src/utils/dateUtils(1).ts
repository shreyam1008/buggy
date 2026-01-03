// ============================================================================
// DATE UTILITIES
// ============================================================================

import NepaliDate from 'nepali-date-converter';

/**
 * Date format validation and constraints
 */
export const DATE_CONSTRAINTS = {
  BS: { minYear: 1970, maxYear: 2100, minMonth: 1, maxMonth: 12, minDay: 1, maxDay: 32 },
  AD: { minYear: 1900, maxYear: 2100, minMonth: 1, maxMonth: 12, minDay: 1, maxDay: 31 },
} as const;

/**
 * Parsed date structure
 */
export interface ParsedDate {
  day: number;
  month: number;
  year: number;
}

/**
 * Parse date input in DD-MM-YYYY format by removing non-digit characters
 * Works for both BS and AD dates
 * @param input - Date string (can include dashes or just digits)
 * @returns Parsed date object or null if invalid format
 */
export function parseDateInput(input: string): ParsedDate | null {
  const digits = input.replace(/\D/g, '');
  
  if (digits.length >= 8) {
    return {
      day: parseInt(digits.substring(0, 2), 10),
      month: parseInt(digits.substring(2, 4), 10),
      year: parseInt(digits.substring(4, 8), 10),
    };
  }
  return null;
}

/**
 * Format date input as DD-MM-YYYY with auto-insertion of dashes
 * @param value - Input value to format
 * @returns Formatted string
 */
export function formatDateInput(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  let formatted = '';
  
  if (cleaned.length > 0) {
    formatted = cleaned.substring(0, 2);
    if (cleaned.length > 2) {
      formatted += '-' + cleaned.substring(2, 4);
    }
    if (cleaned.length > 4) {
      formatted += '-' + cleaned.substring(4, 8);
    }
  }
  
  return formatted;
}

/**
 * Validate if parsed date is within valid BS range
 * @param parsed - Parsed date object
 * @returns True if valid
 */
export function isValidBSDate(parsed: ParsedDate): boolean {
  const { day, month, year } = parsed;
  const { minYear, maxYear, minMonth, maxMonth, minDay, maxDay } = DATE_CONSTRAINTS.BS;
  return (
    year >= minYear && year <= maxYear &&
    month >= minMonth && month <= maxMonth &&
    day >= minDay && day <= maxDay
  );
}

/**
 * Validate if parsed date is within valid AD range
 * @param parsed - Parsed date object
 * @returns True if valid
 */
export function isValidADDate(parsed: ParsedDate): boolean {
  const { day, month, year } = parsed;
  const { minYear, maxYear, minMonth, maxMonth, minDay, maxDay } = DATE_CONSTRAINTS.AD;
  return (
    year >= minYear && year <= maxYear &&
    month >= minMonth && month <= maxMonth &&
    day >= minDay && day <= maxDay
  );
}

/**
 * Convert BS date to AD date
 * @param day - Day in BS
 * @param month - Month in BS (1-12)
 * @param year - Year in BS
 * @returns ISO date string (YYYY-MM-DD) or null if conversion fails
 */
export function convertBStoAD(day: number, month: number, year: number): string | null {
  try {
    const nepaliDate = new NepaliDate(year, month - 1, day);
    const adDate = nepaliDate.toJsDate();
    return formatDateToISO(adDate);
  } catch (e) {
    return null;
  }
}

/**
 * Convert AD date to BS date
 * @param day - Day in AD
 * @param month - Month in AD (1-12)
 * @param year - Year in AD
 * @returns BS date string (DD-MM-YYYY) or null if conversion fails
 */
export function convertADtoBS(day: number, month: number, year: number): string | null {
  try {
    const adDate = new Date(year, month - 1, day);
    const nepaliDate = new NepaliDate(adDate);
    const bsYear = nepaliDate.getYear();
    const bsMonth = padZero(nepaliDate.getMonth() + 1);
    const bsDay = padZero(nepaliDate.getDate());
    return `${bsDay}-${bsMonth}-${bsYear}`;
  } catch (e) {
    return null;
  }
}

/**
 * Convert AD ISO date string to BS date
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns BS date string (DD-MM-YYYY) or null if conversion fails
 */
export function convertADISOtoBS(isoDate: string): string | null {
  try {
    const adDate = new Date(isoDate);
    const nepaliDate = new NepaliDate(adDate);
    const bsYear = nepaliDate.getYear();
    const bsMonth = padZero(nepaliDate.getMonth() + 1);
    const bsDay = padZero(nepaliDate.getDate());
    return `${bsDay}-${bsMonth}-${bsYear}`;
  } catch (e) {
    return null;
  }
}

/**
 * Pad number with leading zero if single digit
 * @param num - Number to pad
 * @returns Padded string
 */
export function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * Format Date object to ISO date string (YYYY-MM-DD)
 * @param date - Date object
 * @returns ISO date string
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format Date object to human-readable string
 * @param date - Date object or ISO string
 * @returns Formatted date string (e.g., "January 15, 2025")
 */
export function formatDateToReadable(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Get current date in ISO format
 * @returns Current date as YYYY-MM-DD
 */
export function getCurrentDateISO(): string {
  return formatDateToISO(new Date());
}

/**
 * Get current datetime in ISO format for datetime-local inputs
 * @returns Current datetime as YYYY-MM-DDTHH:mm
 */
export function getCurrentDateTimeLocal(): string {
  return new Date().toISOString().slice(0, 16);
}

/**
 * Extract date part from ISO datetime string
 * @param isoDateTime - ISO datetime string (e.g., "2025-01-15T10:30:00")
 * @returns Date part as YYYY-MM-DD
 */
export function extractDateFromISO(isoDateTime: string): string {
  return isoDateTime.split('T')[0];
}

/**
 * Get tomorrow's date in ISO format
 * @returns Tomorrow's date as YYYY-MM-DD
 */
export function getTomorrowDateISO(): string {
  const tomorrow = new Date(Date.now() + 86400000);
  return formatDateToISO(tomorrow);
}
