/**
 * Recent Locations Hook
 *
 * Tracks and provides quick access to recently used locations.
 * Stores in localStorage for persistence across sessions.
 */

import { useState, useEffect, useCallback } from 'react';
import { isFeatureEnabled } from '@/lib/featureFlags';

const STORAGE_KEY = 'frf-recent-locations';
const MAX_RECENT_LOCATIONS = 10;

export interface Location {
  text: string;       // Location description
  country: string;    // Country name
  usedAt: string;     // ISO timestamp
  useCount: number;   // How many times used
}

/**
 * Hook for managing recent locations
 */
export function useRecentLocations() {
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);
  const enabled = isFeatureEnabled('recentLocations');

  // Load recent locations from localStorage
  useEffect(() => {
    if (!enabled) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const locations = JSON.parse(stored) as Location[];
        setRecentLocations(locations);
      }
    } catch (error) {
      console.error('Failed to load recent locations:', error);
    }
  }, [enabled]);

  /**
   * Add a location to recent list
   */
  const addLocation = useCallback((text: string, country: string) => {
    if (!enabled || !text || !country) return;

    setRecentLocations((prev) => {
      // Check if location already exists
      const existingIndex = prev.findIndex(
        (loc) => loc.text.toLowerCase() === text.toLowerCase() &&
                 loc.country.toLowerCase() === country.toLowerCase()
      );

      let updated: Location[];

      if (existingIndex >= 0) {
        // Move to top and increment use count
        const existing = prev[existingIndex];
        updated = [
          {
            ...existing,
            usedAt: new Date().toISOString(),
            useCount: existing.useCount + 1,
          },
          ...prev.slice(0, existingIndex),
          ...prev.slice(existingIndex + 1),
        ];
      } else {
        // Add new location to top
        updated = [
          {
            text,
            country,
            usedAt: new Date().toISOString(),
            useCount: 1,
          },
          ...prev,
        ].slice(0, MAX_RECENT_LOCATIONS); // Keep only MAX_RECENT_LOCATIONS
      }

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent locations:', error);
      }

      return updated;
    });
  }, [enabled]);

  /**
   * Clear all recent locations
   */
  const clearLocations = useCallback(() => {
    setRecentLocations([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear recent locations:', error);
    }
  }, []);

  /**
   * Remove a specific location
   */
  const removeLocation = useCallback((text: string, country: string) => {
    setRecentLocations((prev) => {
      const updated = prev.filter(
        (loc) => !(loc.text.toLowerCase() === text.toLowerCase() &&
                   loc.country.toLowerCase() === country.toLowerCase())
      );

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to update recent locations:', error);
      }

      return updated;
    });
  }, []);

  return {
    recentLocations,
    addLocation,
    clearLocations,
    removeLocation,
    enabled,
  };
}

/**
 * Hook for tracking recently used values (generic)
 */
export function useRecentValues<T>(
  storageKey: string,
  maxItems: number = 10
) {
  const [recentValues, setRecentValues] = useState<T[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const values = JSON.parse(stored) as T[];
        setRecentValues(values);
      }
    } catch (error) {
      console.error(`Failed to load ${storageKey}:`, error);
    }
  }, [storageKey]);

  /**
   * Add a value to recent list
   */
  const addValue = useCallback((value: T) => {
    setRecentValues((prev) => {
      // Check if value already exists
      const existingIndex = prev.findIndex(
        (v) => JSON.stringify(v) === JSON.stringify(value)
      );

      let updated: T[];

      if (existingIndex >= 0) {
        // Move to top
        updated = [
          value,
          ...prev.slice(0, existingIndex),
          ...prev.slice(existingIndex + 1),
        ];
      } else {
        // Add new value to top
        updated = [value, ...prev].slice(0, maxItems);
      }

      // Save to localStorage
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (error) {
        console.error(`Failed to save ${storageKey}:`, error);
      }

      return updated;
    });
  }, [storageKey, maxItems]);

  /**
   * Clear all values
   */
  const clearValues = useCallback(() => {
    setRecentValues([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Failed to clear ${storageKey}:`, error);
    }
  }, [storageKey]);

  return {
    recentValues,
    addValue,
    clearValues,
  };
}
