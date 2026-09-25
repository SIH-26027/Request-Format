import { DepartmentCode } from '../types/request';

/**
 * Generates an official-looking Railway Block Request ID
 * Format: REQ-{DEPT}-{YYYYMMDD}-{XXXX}
 */
export function generateRequestId(dept: DepartmentCode): string {
  const code = dept === 'ENGINEERING' ? 'ENG' : dept;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${code}-${dateStr}-${randomSuffix}`;
}

/**
 * Formats duration from hours and minutes
 */
export function formatDuration(hours: number, minutes: number): string {
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} hr${h > 1 ? 's' : ''}`);
  if (m > 0 || h === 0) parts.push(`${m} min${m > 1 ? 's' : ''}`);
  return parts.join(' ');
}

/**
 * Calculates time difference between start and end time (HH:MM)
 */
export function calculateDurationFromTimes(startTime: string, endTime: string): { hours: number; minutes: number } {
  if (!startTime || !endTime) return { hours: 0, minutes: 0 };
  
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
    return { hours: 0, minutes: 0 };
  }
  
  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  
  // Handle overnight block crossing midnight
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  const diffMinutes = endMinutes - startMinutes;
  return {
    hours: Math.floor(diffMinutes / 60),
    minutes: diffMinutes % 60
  };
}

/**
 * Today's date string in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Tomorrow's date string in YYYY-MM-DD
 */
export function getTomorrowDateString(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}
