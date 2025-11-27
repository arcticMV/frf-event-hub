/**
 * Duplicate Detection Utility
 *
 * Finds similar events based on title, location, date proximity, and category.
 * Uses fuzzy matching for better detection.
 */

export interface SimilarityMatch {
  id: string;
  score: number;          // 0-100
  matchReasons: string[];
  event: any;
}

/**
 * Calculate similarity score between two strings (0-1)
 * Uses simple Levenshtein-like approach
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Check if one string contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8;
  }

  // Split into words and check overlap
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  const commonWords = words1.filter(w => words2.includes(w));
  const wordOverlap = (2 * commonWords.length) / (words1.length + words2.length);

  if (wordOverlap > 0.5) {
    return 0.6 + (wordOverlap * 0.2);
  }

  // Character n-gram similarity (simplified)
  const bigrams1 = getBigrams(s1);
  const bigrams2 = getBigrams(s2);
  const intersection = bigrams1.filter(b => bigrams2.includes(b));
  const bigramSimilarity = (2 * intersection.length) / (bigrams1.length + bigrams2.length);

  return bigramSimilarity;
}

/**
 * Get character bigrams for similarity matching
 */
function getBigrams(str: string): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.push(str.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * Check if two dates are within proximity (±3 days by default)
 */
function areDatesProximate(date1: Date | any, date2: Date | any, daysThreshold: number = 3): boolean {
  try {
    let d1: Date, d2: Date;

    // Handle Firestore Timestamp objects
    if (date1?.toDate) {
      d1 = date1.toDate();
    } else if (typeof date1 === 'string') {
      d1 = new Date(date1);
    } else {
      d1 = date1;
    }

    if (date2?.toDate) {
      d2 = date2.toDate();
    } else if (typeof date2 === 'string') {
      d2 = new Date(date2);
    } else {
      d2 = date2;
    }

    const diffMs = Math.abs(d1.getTime() - d2.getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays <= daysThreshold;
  } catch (error) {
    return false;
  }
}

/**
 * Find similar events in a collection
 */
export function findSimilarEvents(
  newEvent: {
    title: string;
    location?: { text?: { eng?: string }, country?: { eng?: string } };
    dateTime?: any;
    category?: string;
  },
  existingEvents: any[],
  options: {
    titleThreshold?: number;      // Minimum title similarity (0-1)
    dateProximityDays?: number;   // Date proximity in days
    minimumScore?: number;        // Minimum overall score to return (0-100)
    maxResults?: number;          // Maximum number of results
  } = {}
): SimilarityMatch[] {
  const {
    titleThreshold = 0.6,
    dateProximityDays = 3,
    minimumScore = 50,
    maxResults = 5,
  } = options;

  const matches: SimilarityMatch[] = [];

  for (const existing of existingEvents) {
    const score = 0;
    const matchReasons: string[] = [];
    let totalScore = 0;
    let weights = 0;

    // Title similarity (weight: 40)
    const existingTitle = existing.event?.title || existing.title || '';
    if (newEvent.title && existingTitle) {
      const titleSim = stringSimilarity(newEvent.title, existingTitle);
      if (titleSim >= titleThreshold) {
        totalScore += titleSim * 40;
        weights += 40;
        matchReasons.push(`${Math.round(titleSim * 100)}% title match`);
      }
    }

    // Location similarity (weight: 25)
    const newLocation = newEvent.location?.text?.eng || '';
    const existingLocation = existing.event?.location?.text?.eng || existing.location?.text?.eng || '';
    if (newLocation && existingLocation) {
      const locationSim = stringSimilarity(newLocation, existingLocation);
      if (locationSim >= 0.7) {
        totalScore += locationSim * 25;
        weights += 25;
        matchReasons.push(`${Math.round(locationSim * 100)}% location match`);
      }
    }

    // Country match (weight: 15)
    const newCountry = newEvent.location?.country?.eng || '';
    const existingCountry = existing.event?.location?.country?.eng || existing.location?.country?.eng || '';
    if (newCountry && existingCountry) {
      if (newCountry.toLowerCase() === existingCountry.toLowerCase()) {
        totalScore += 15;
        weights += 15;
        matchReasons.push('Same country');
      }
    }

    // Date proximity (weight: 10)
    const newDate = newEvent.dateTime;
    const existingDate = existing.event?.dateTime || existing.dateTime;
    if (newDate && existingDate) {
      if (areDatesProximate(newDate, existingDate, dateProximityDays)) {
        totalScore += 10;
        weights += 10;
        matchReasons.push(`Within ${dateProximityDays} days`);
      }
    }

    // Category match (weight: 10)
    const newCategory = newEvent.category || '';
    const existingCategory = existing.event?.category || existing.category || '';
    if (newCategory && existingCategory) {
      if (newCategory.toLowerCase() === existingCategory.toLowerCase()) {
        totalScore += 10;
        weights += 10;
        matchReasons.push('Same category');
      }
    }

    // Calculate final score (0-100)
    // Use fixed total weight (100) to prevent single-match high scores
    // Title match is required - without it, don't consider as duplicate
    const hasTitleMatch = matchReasons.some(r => r.includes('title match'));
    const finalScore = hasTitleMatch ? (totalScore / 100) * 100 : 0;

    if (finalScore >= minimumScore && matchReasons.length > 0 && hasTitleMatch) {
      matches.push({
        id: existing.id || existing.eventId,
        score: Math.round(finalScore),
        matchReasons,
        event: existing,
      });
    }
  }

  // Sort by score (highest first) and limit results
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Check if event is likely a duplicate (high similarity)
 */
export function isLikelyDuplicate(
  newEvent: any,
  existingEvents: any[],
  threshold: number = 80
): boolean {
  const matches = findSimilarEvents(newEvent, existingEvents, {
    minimumScore: threshold,
    maxResults: 1,
  });

  return matches.length > 0;
}

/**
 * Get duplicate warning message
 */
export function getDuplicateWarning(match: SimilarityMatch): string {
  const reasons = match.matchReasons.join(', ');
  return `${match.score}% match: ${reasons}`;
}
