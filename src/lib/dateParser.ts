/**
 * Smart Date Parser
 *
 * Parses natural language dates and multiple formats.
 * Examples: "tomorrow 3pm", "in 2 hours", "Jan 17 2025", "2025-01-17T14:30Z"
 */

import { Timestamp } from 'firebase/firestore';

export interface ParsedDate {
  date: Date;
  timestamp: Timestamp;
  formatted: string;  // For datetime-local input (YYYY-MM-DDTHH:mm)
  confidence: 'high' | 'medium' | 'low';
  parsedAs: string;   // Description of how it was parsed
}

/**
 * Parse natural language date input
 */
export function parseNaturalDate(input: string): ParsedDate | null {
  if (!input || input.trim() === '') {
    return null;
  }

  const trimmed = input.trim().toLowerCase();
  const now = new Date();

  try {
    // Try ISO format first (highest confidence)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(input)) {
      const date = new Date(input);
      if (!isNaN(date.getTime())) {
        return createParsedDate(date, 'high', 'ISO 8601 format');
      }
    }

    // Relative time patterns
    const relativePatterns = [
      // "now", "right now"
      { pattern: /^(now|right now)$/i, fn: () => now },

      // "in X minutes/hours/days/weeks"
      {
        pattern: /^in (\d+) (minute|hour|day|week)s?$/i,
        fn: (match: RegExpMatchArray) => {
          const amount = parseInt(match[1]);
          const unit = match[2];
          const date = new Date(now);

          switch (unit) {
            case 'minute': date.setMinutes(date.getMinutes() + amount); break;
            case 'hour': date.setHours(date.getHours() + amount); break;
            case 'day': date.setDate(date.getDate() + amount); break;
            case 'week': date.setDate(date.getDate() + (amount * 7)); break;
          }
          return date;
        }
      },

      // "X minutes/hours/days ago"
      {
        pattern: /^(\d+) (minute|hour|day|week)s? ago$/i,
        fn: (match: RegExpMatchArray) => {
          const amount = parseInt(match[1]);
          const unit = match[2];
          const date = new Date(now);

          switch (unit) {
            case 'minute': date.setMinutes(date.getMinutes() - amount); break;
            case 'hour': date.setHours(date.getHours() - amount); break;
            case 'day': date.setDate(date.getDate() - amount); break;
            case 'week': date.setDate(date.getDate() - (amount * 7)); break;
          }
          return date;
        }
      },

      // "tomorrow", "yesterday", "today"
      {
        pattern: /^tomorrow$/i,
        fn: () => {
          const date = new Date(now);
          date.setDate(date.getDate() + 1);
          return date;
        }
      },
      {
        pattern: /^yesterday$/i,
        fn: () => {
          const date = new Date(now);
          date.setDate(date.getDate() - 1);
          return date;
        }
      },
      {
        pattern: /^today$/i,
        fn: () => now
      },

      // "tomorrow at 3pm", "today at 14:30"
      {
        pattern: /^(today|tomorrow|yesterday) at (\d{1,2})(?::(\d{2}))?\s?(am|pm)?$/i,
        fn: (match: RegExpMatchArray) => {
          const when = match[1].toLowerCase();
          let hours = parseInt(match[2]);
          const minutes = match[3] ? parseInt(match[3]) : 0;
          const ampm = match[4]?.toLowerCase();

          // Convert to 24-hour format
          if (ampm === 'pm' && hours < 12) hours += 12;
          if (ampm === 'am' && hours === 12) hours = 0;

          const date = new Date(now);
          if (when === 'tomorrow') date.setDate(date.getDate() + 1);
          if (when === 'yesterday') date.setDate(date.getDate() - 1);

          date.setHours(hours, minutes, 0, 0);
          return date;
        }
      },

      // "next Monday", "next Tuesday", etc.
      {
        pattern: /^next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i,
        fn: (match: RegExpMatchArray) => {
          const targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            .indexOf(match[1].toLowerCase());
          const date = new Date(now);
          const currentDay = date.getDay();
          const daysUntil = (targetDay + 7 - currentDay) % 7 || 7;
          date.setDate(date.getDate() + daysUntil);
          return date;
        }
      },

      // "last Monday", "last Tuesday", etc.
      {
        pattern: /^last (monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i,
        fn: (match: RegExpMatchArray) => {
          const targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            .indexOf(match[1].toLowerCase());
          const date = new Date(now);
          const currentDay = date.getDay();
          const daysAgo = (currentDay + 7 - targetDay) % 7 || 7;
          date.setDate(date.getDate() - daysAgo);
          return date;
        }
      },
    ];

    // Try relative patterns
    for (const { pattern, fn } of relativePatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const date = fn(match);
        return createParsedDate(date, 'high', `Relative time: "${trimmed}"`);
      }
    }

    // Try standard date formats
    const standardFormats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,      // MM/DD/YYYY or DD/MM/YYYY
      /^(\d{4})-(\d{2})-(\d{2})$/,            // YYYY-MM-DD
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,        // DD-MM-YYYY
    ];

    for (const format of standardFormats) {
      const match = input.match(format);
      if (match) {
        const date = new Date(input);
        if (!isNaN(date.getTime())) {
          return createParsedDate(date, 'high', 'Standard date format');
        }
      }
    }

    // Try parsing with Date constructor (medium confidence)
    const date = new Date(input);
    if (!isNaN(date.getTime())) {
      return createParsedDate(date, 'medium', 'Date.parse()');
    }

  } catch (error) {
    console.error('Date parsing error:', error);
  }

  return null;
}

/**
 * Create ParsedDate object
 */
function createParsedDate(date: Date, confidence: 'high' | 'medium' | 'low', parsedAs: string): ParsedDate {
  // Format for datetime-local input: YYYY-MM-DDTHH:mm
  const formatted = date.toISOString().slice(0, 16);

  return {
    date,
    timestamp: Timestamp.fromDate(date),
    formatted,
    confidence,
    parsedAs,
  };
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Calculate duration between two dates
 */
export function calculateDuration(start: Date, end: Date): {
  days: number;
  hours: number;
  minutes: number;
  totalHours: number;
  humanReadable: string;
} {
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let humanReadable = '';
  if (diffDays > 0) {
    humanReadable += `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    if (hours > 0) humanReadable += `, ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    humanReadable += `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    if (minutes > 0) humanReadable += `, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    humanReadable += `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
  }

  return {
    days: diffDays,
    hours,
    minutes,
    totalHours: diffHours,
    humanReadable,
  };
}

/**
 * Get duration from now
 */
export function getDurationFromNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const isPast = diffMs > 0;
  const absDiffMs = Math.abs(diffMs);

  const seconds = Math.floor(absDiffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let result = '';
  if (days > 0) {
    result = `${days} day${days !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    result = `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    result = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    result = `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  return isPast ? `${result} ago` : `in ${result}`;
}

/**
 * Check if date is in the past
 */
export function isInPast(date: Date): boolean {
  return date.getTime() < new Date().getTime();
}

/**
 * Check if date is ongoing (started but not ended)
 */
export function isOngoing(startDate: Date, endDate?: Date): boolean {
  const now = new Date();
  const started = startDate.getTime() <= now.getTime();
  const notEnded = !endDate || endDate.getTime() > now.getTime();
  return started && notEnded;
}
