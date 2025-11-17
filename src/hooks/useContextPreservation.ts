/**
 * Context Preservation Hook
 *
 * Saves and restores page state (filters, scroll position, etc.) across navigation.
 * Uses sessionStorage for same-session persistence.
 */

import { useState, useEffect, useCallback } from 'react';
import { isFeatureEnabled } from '@/lib/featureFlags';

const STORAGE_PREFIX = 'frf-context-';

export interface PageContext {
  filters?: any;
  scrollPosition?: number;
  selectedId?: string;
  viewMode?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

/**
 * Hook to preserve page context across navigation
 */
export function useContextPreservation(pageKey: string) {
  const [context, setContext] = useState<PageContext>({});
  const [restored, setRestored] = useState(false);

  const enabled = isFeatureEnabled('contextPreservation');
  const storageKey = `${STORAGE_PREFIX}${pageKey}`;

  // Restore context on mount
  useEffect(() => {
    if (!enabled || restored) return;

    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsedContext = JSON.parse(saved);
        setContext(parsedContext);
        setRestored(true);

        // Restore scroll position after a short delay
        if (parsedContext.scrollPosition !== undefined) {
          setTimeout(() => {
            window.scrollTo({
              top: parsedContext.scrollPosition,
              behavior: 'smooth',
            });
          }, 100);
        }
      } else {
        setRestored(true);
      }
    } catch (error) {
      console.error('Failed to restore context:', error);
      setRestored(true);
    }
  }, [enabled, storageKey, restored]);

  // Save context whenever it changes
  useEffect(() => {
    if (!enabled || !restored) return;

    try {
      if (Object.keys(context).length > 0) {
        sessionStorage.setItem(storageKey, JSON.stringify(context));
      }
    } catch (error) {
      console.error('Failed to save context:', error);
    }
  }, [context, enabled, storageKey, restored]);

  /**
   * Update context (merge with existing)
   */
  const updateContext = useCallback((updates: Partial<PageContext>) => {
    setContext((prev) => ({ ...prev, ...updates }));
  }, []);

  // Save scroll position periodically
  useEffect(() => {
    if (!enabled || !restored) return;

    const handleScroll = () => {
      updateContext({ scrollPosition: window.scrollY });
    };

    // Debounce scroll updates
    let scrollTimer: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(handleScroll, 200);
    };

    window.addEventListener('scroll', debouncedScroll);
    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener('scroll', debouncedScroll);
    };
  }, [enabled, restored, updateContext]);

  /**
   * Clear context
   */
  const clearContext = useCallback(() => {
    setContext({});
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear context:', error);
    }
  }, [storageKey]);

  /**
   * Get specific context value
   */
  const getContextValue = useCallback(<T = any>(key: string, defaultValue?: T): T | undefined => {
    return (context[key] as T) ?? defaultValue;
  }, [context]);

  return {
    context,
    updateContext,
    clearContext,
    getContextValue,
    restored,
    enabled,
  };
}

/**
 * Hook for tracking recently viewed items
 */
export function useViewHistory<T extends { id: string }>(
  storageKey: string,
  maxItems: number = 10
) {
  const [history, setHistory] = useState<T[]>([]);

  // Load from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`${STORAGE_PREFIX}history-${storageKey}`);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, [storageKey]);

  /**
   * Add item to history
   */
  const addToHistory = useCallback((item: T) => {
    setHistory((prev) => {
      // Remove if already exists
      const filtered = prev.filter((i) => i.id !== item.id);

      // Add to beginning
      const updated = [item, ...filtered].slice(0, maxItems);

      // Save to sessionStorage
      try {
        sessionStorage.setItem(
          `${STORAGE_PREFIX}history-${storageKey}`,
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error('Failed to save history:', error);
      }

      return updated;
    });
  }, [storageKey, maxItems]);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      sessionStorage.removeItem(`${STORAGE_PREFIX}history-${storageKey}`);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, [storageKey]);

  return {
    history,
    addToHistory,
    clearHistory,
  };
}
