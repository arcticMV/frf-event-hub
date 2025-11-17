/**
 * Duplicate Check Hook
 *
 * Real-time duplicate detection as user types.
 * Searches across all event collections.
 */

import { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { findSimilarEvents, SimilarityMatch } from '@/lib/duplicateDetection';
import { isFeatureEnabled } from '@/lib/featureFlags';

const DEBOUNCE_DELAY = 500; // ms

export interface DuplicateCheckOptions {
  title: string;
  location?: { text?: { eng?: string }, country?: { eng?: string } };
  dateTime?: any;
  category?: string;
  enabled?: boolean;
  checkCollections?: string[];  // Which collections to check
}

/**
 * Hook for real-time duplicate detection
 */
export function useDuplicateCheck({
  title,
  location,
  dateTime,
  category,
  enabled = true,
  checkCollections = ['staging_events', 'analysis_queue', 'verified_events'],
}: DuplicateCheckOptions) {
  const [checking, setChecking] = useState(false);
  const [duplicates, setDuplicates] = useState<SimilarityMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  const featureEnabled = isFeatureEnabled('duplicateDetection');

  const checkForDuplicates = useCallback(async () => {
    if (!featureEnabled || !enabled || !title || title.length < 3) {
      setDuplicates([]);
      return;
    }

    setChecking(true);
    setError(null);

    try {
      // Fetch events from all relevant collections
      const allEvents: any[] = [];

      for (const collectionName of checkCollections) {
        try {
          // Query with title substring match for better performance
          const titleLower = title.toLowerCase();
          const titleWords = titleLower.split(/\s+/).filter(w => w.length > 2);

          // Get a broader set of events (we'll filter with similarity scoring)
          const q = query(
            collection(db, collectionName),
            limit(100) // Limit to prevent excessive reads
          );

          const snapshot = await getDocs(q);
          const events = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            collection: collectionName,
          }));

          allEvents.push(...events);
        } catch (err) {
          console.error(`Error fetching from ${collectionName}:`, err);
        }
      }

      // Find similar events using our similarity algorithm
      const similar = findSimilarEvents(
        { title, location, dateTime, category },
        allEvents,
        {
          titleThreshold: 0.6,
          dateProximityDays: 3,
          minimumScore: 60,  // Show matches with 60%+ similarity
          maxResults: 5,
        }
      );

      setDuplicates(similar);
    } catch (err: any) {
      console.error('Duplicate check error:', err);
      setError(err.message || 'Failed to check for duplicates');
    } finally {
      setChecking(false);
    }
  }, [title, location, dateTime, category, checkCollections, enabled, featureEnabled]);

  // Debounced check
  useEffect(() => {
    if (!featureEnabled || !enabled) {
      return;
    }

    const timer = setTimeout(() => {
      checkForDuplicates();
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [checkForDuplicates, featureEnabled, enabled]);

  return {
    checking,
    duplicates,
    error,
    hasDuplicates: duplicates.length > 0,
    highConfidenceDuplicate: duplicates.some(d => d.score >= 80),
    refresh: checkForDuplicates,
  };
}
