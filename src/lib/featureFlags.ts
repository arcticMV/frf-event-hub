/**
 * Feature Flags System
 *
 * Toggle features on/off for safe testing and gradual rollout.
 * All features are client-side only and can be disabled without breaking existing functionality.
 */

export const FEATURES = {
  // Phase 1: Core Helpers
  keyboardShortcuts: true,      // Escape, Ctrl+S, Arrow keys navigation
  formAutosave: true,           // Auto-save drafts to localStorage
  realTimeValidation: true,     // Inline validation as you type

  // Phase 2: Data Entry Helpers
  smartDateParser: true,        // Natural language date input
  recentLocations: true,        // Recent locations dropdown
  durationCalculator: true,     // Calculate event duration
  copyFromLast: true,           // Copy data from last event

  // Phase 3: Intelligence Features
  duplicateDetection: true,     // Warn about potential duplicates
  enhancedFilters: true,        // Date range, multi-select filters
  contextPreservation: true,    // Remember filters/scroll position
  savedFilterPresets: true,     // Save common filter combinations

  // Phase 4: Workflow Optimizations
  quickActions: true,           // "Approve & Next", "Verify & Next" buttons
  inlineEdit: true,             // Double-click to edit table cells
  improvedErrors: true,         // Better error messages
  ongoingEventTracker: true,    // Visual indicator for ongoing events
} as const;

export type FeatureFlag = keyof typeof FEATURES;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return FEATURES[feature] ?? false;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return Object.entries(FEATURES)
    .filter(([_, enabled]) => enabled)
    .map(([feature, _]) => feature as FeatureFlag);
}

/**
 * Feature flag hook for React components
 */
export function useFeature(feature: FeatureFlag): boolean {
  return isFeatureEnabled(feature);
}
