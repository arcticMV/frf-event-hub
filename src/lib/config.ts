import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: string;
  };
  firebase: {
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  gcp: {
    region: string;
    services: {
      firestore: {
        enabled: boolean;
        collections: {
          events: string;
          users: string;
          registrations: string;
        };
      };
      storage: {
        enabled: boolean;
        buckets: {
          images: string;
          documents: string;
        };
      };
      functions: {
        enabled: boolean;
        region: string;
      };
      authentication: {
        enabled: boolean;
        providers: string[];
      };
    };
  };
  features: {
    registration: {
      enabled: boolean;
      requireApproval: boolean;
      maxAttendees: number;
    };
    notifications: {
      email: {
        enabled: boolean;
      };
      push: {
        enabled: boolean;
      };
    };
    analytics: {
      enabled: boolean;
    };
  };
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
}

function replaceEnvVars(str: string): string {
  return str.replace(/\${([^}]+)}/g, (_, envVar) => {
    return process.env[envVar] || '';
  });
}

function loadConfig(): AppConfig {
  const configPath = path.join(process.cwd(), 'config', 'app.config.yaml');
  const configFile = fs.readFileSync(configPath, 'utf8');
  const configWithEnv = replaceEnvVars(configFile);
  return yaml.parse(configWithEnv) as AppConfig;
}

let configCache: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!configCache) {
    configCache = loadConfig();
  }
  return configCache;
}

export type { AppConfig };