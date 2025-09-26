/**
 * Firebase/GCP Region Configuration
 * Primary: europe-west4 (Netherlands)
 * Secondary: europe-north1 (Finland)
 * Additional fallbacks for European regions
 */

export const REGIONS = {
  PRIMARY: 'europe-west4',
  FALLBACKS: [
    'europe-north1',
    'europe-west1',
    'europe-central2',
    'europe-west3',
    'europe-west6',
  ],
} as const;

export type Region = typeof REGIONS.PRIMARY | typeof REGIONS.FALLBACKS[number];

/**
 * Get the configured region with fallback support
 * Checks environment variables first, then uses defaults
 */
export function getRegion(): Region {
  // Check if region is explicitly set in environment
  if (process.env.GCP_REGION) {
    return process.env.GCP_REGION as Region;
  }

  // Default to primary region
  return REGIONS.PRIMARY;
}

/**
 * Get all regions in order of preference
 * Useful for multi-region deployments or failover scenarios
 */
export function getRegionsInOrder(): Region[] {
  const primary = getRegion();
  const fallbacks = REGIONS.FALLBACKS.filter(r => r !== primary);
  return [primary, ...fallbacks];
}

/**
 * Configuration for different Firebase services by region
 * Some services might not be available in all regions
 */
export const SERVICE_AVAILABILITY = {
  'europe-west4': {
    firestore: true,
    functions: true,
    storage: true,
    hosting: true,
    appCheck: true,
    vertexAI: true,
  },
  'europe-north1': {
    firestore: true,
    functions: true,
    storage: true,
    hosting: true,
    appCheck: true,
    vertexAI: false, // Not available in Finland
  },
  'europe-west1': {
    firestore: true,
    functions: true,
    storage: true,
    hosting: true,
    appCheck: true,
    vertexAI: true,
  },
  'europe-central2': {
    firestore: true,
    functions: true,
    storage: true,
    hosting: true,
    appCheck: true,
    vertexAI: false,
  },
  'europe-west3': {
    firestore: true,
    functions: true,
    storage: true,
    hosting: true,
    appCheck: true,
    vertexAI: true,
  },
  'europe-west6': {
    firestore: true,
    functions: true,
    storage: true,
    hosting: true,
    appCheck: true,
    vertexAI: true,
  },
} as const;

/**
 * Check if a service is available in a specific region
 */
export function isServiceAvailable(
  service: keyof typeof SERVICE_AVAILABILITY['europe-west4'],
  region: Region = getRegion()
): boolean {
  return SERVICE_AVAILABILITY[region]?.[service] ?? false;
}

/**
 * Get the best region for a specific service
 */
export function getBestRegionForService(
  service: keyof typeof SERVICE_AVAILABILITY['europe-west4']
): Region {
  const regions = getRegionsInOrder();

  for (const region of regions) {
    if (isServiceAvailable(service, region)) {
      return region;
    }
  }

  // Fallback to primary if no suitable region found
  return REGIONS.PRIMARY;
}