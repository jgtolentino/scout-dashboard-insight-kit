import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Load medallion configuration
const configPath = path.join(__dirname, '../../../medallion-config.yaml');
let medallionConfig: any = {};

try {
  const configFile = readFileSync(configPath, 'utf8');
  medallionConfig = parse(configFile);
} catch (error) {
  console.warn('Failed to load medallion-config.yaml, using environment variables only');
}

export const config = {
  // Application
  app: {
    name: process.env.VITE_APP_NAME || medallionConfig.application?.name || 'scout-analytics-dashboard',
    version: process.env.VITE_APP_VERSION || medallionConfig.application?.version || '3.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10)
  },

  // Feature Flags
  featureFlags: {
    realTimeStreaming: process.env.VITE_REAL_TIME_STREAMING === 'true' || medallionConfig.feature_flags?.real_time_streaming || false,
    advancedAnalytics: process.env.VITE_ADVANCED_ANALYTICS === 'true' || medallionConfig.feature_flags?.advanced_analytics || true,
    mlPredictions: process.env.VITE_ML_PREDICTIONS === 'true' || medallionConfig.feature_flags?.ml_predictions || false,
    mockData: process.env.VITE_USE_MOCKS === 'true' || medallionConfig.feature_flags?.mock_data || false,
    auditLogs: process.env.AUDIT_LOGS === 'true' || medallionConfig.feature_flags?.audit_logs || true,
    telemetry: process.env.ENABLE_TELEMETRY === 'true' || medallionConfig.monitoring?.telemetry?.enabled || true
  },

  // Azure Configuration
  azure: {
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
    resourceGroup: medallionConfig.azure?.resource_group || 'scout-analytics-rg',

    // Storage (ADLS2)
    storage: {
      accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
      datalakeUrl: process.env.AZURE_DATALAKE_URL,
      containerName: medallionConfig.azure?.storage?.container_name || 'scout-data'
    },

    // Databricks
    databricks: {
      workspaceUrl: process.env.DATABRICKS_WORKSPACE_URL,
      token: process.env.DATABRICKS_TOKEN,
      clusterId: process.env.DATABRICKS_CLUSTER_ID
    },

    // OpenAI
    openai: {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4'
    },

    // Key Vault
    keyVault: {
      name: medallionConfig.azure?.keyvault?.name || 'scout-analytics-kv',
      url: medallionConfig.azure?.keyvault?.url || `https://scout-analytics-kv.vault.azure.net/`
    }
  },

  // API Configuration
  api: {
    baseUrl: process.env.VITE_API_BASE_URL || medallionConfig.api?.base_url || '/api/v1',
    corsOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://scout-analytics.azurewebsites.net']
  },

  // Medallion API
  medallion: {
    baseUrl: process.env.VITE_MEDALLION_API_URL || medallionConfig.api?.medallion_url || '/api/medallion',
    wsUrl: process.env.MEDALLION_WS_URL || 'wss://scout-analytics-api.azurewebsites.net',
    
    // Data paths
    bronze: medallionConfig.data?.medallion?.bronze?.path || '/mnt/scout-data/bronze',
    silver: medallionConfig.data?.medallion?.silver?.path || '/mnt/scout-data/silver',
    gold: medallionConfig.data?.medallion?.gold?.path || '/mnt/scout-data/gold'
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/scout_analytics',
    pool: {
      min: medallionConfig.performance?.database?.connection_pool?.min || 5,
      max: medallionConfig.performance?.database?.connection_pool?.max || 20
    }
  },

  // Redis Cache
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: medallionConfig.performance?.cache?.ttl || 300
  },

  // JWT Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },

  // Monitoring
  monitoring: {
    applicationInsights: {
      connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
    },
    metrics: {
      responseTimeP95: medallionConfig.monitoring?.metrics?.response_time_p95 || '500ms',
      errorRate: medallionConfig.monitoring?.metrics?.error_rate || '1%',
      uptime: medallionConfig.monitoring?.metrics?.uptime || '99.9%'
    }
  },

  // Filter Configuration
  filters: {
    geography: {
      hierarchy: medallionConfig.filters?.geography?.hierarchy || ['region', 'city', 'municipality', 'barangay', 'location'],
      maxLength: medallionConfig.filters?.geography?.max_length || {
        region: 100,
        city: 100,
        municipality: 100,
        barangay: 100,
        location: 150
      }
    },
    organization: {
      hierarchy: medallionConfig.filters?.organization?.hierarchy || ['holding_company', 'client', 'category', 'brand', 'sku'],
      maxLength: medallionConfig.filters?.organization?.max_length || {
        holding_company: 100,
        client: 100,
        category: 100,
        brand: 100,
        sku: 150
      }
    },
    time: {
      hierarchy: medallionConfig.filters?.time?.hierarchy || ['year', 'quarter', 'month', 'week', 'day', 'hour'],
      defaultRange: medallionConfig.filters?.time?.default_range || '30_days'
    }
  }
};

// Validation
export function validateConfig(): void {
  const requiredEnvVars = [
    'AZURE_TENANT_ID',
    'AZURE_CLIENT_ID',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_API_KEY'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0 && config.app.environment === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (missing.length > 0) {
    console.warn(`Missing environment variables (using defaults): ${missing.join(', ')}`);
  }
}

export default config;