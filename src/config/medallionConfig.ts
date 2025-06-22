// Medallion Architecture Configuration for Scout Analytics
// Defines data layer access patterns and security boundaries

export interface MedallionLayer {
  name: 'bronze' | 'silver' | 'gold';
  access: 'private' | 'internal' | 'public';
  description: string;
  baseUrl: string;
  authRequired: boolean;
}

export interface DataAsset {
  name: string;
  layer: MedallionLayer['name'];
  path: string;
  format: 'delta' | 'parquet' | 'json';
  updateFrequency: string;
  schema: Record<string, string>;
  description: string;
}

// Medallion layer definitions
export const MEDALLION_LAYERS: Record<string, MedallionLayer> = {
  bronze: {
    name: 'bronze',
    access: 'private',
    description: 'Raw data ingestion layer - ETL processes only',
    baseUrl: 'abfss://bronze@scoutanalyticsdata.dfs.core.windows.net',
    authRequired: true
  },
  silver: {
    name: 'silver',
    access: 'internal',
    description: 'Cleaned and conformed data - internal consumers only',
    baseUrl: 'abfss://silver@scoutanalyticsdata.dfs.core.windows.net',
    authRequired: true
  },
  gold: {
    name: 'gold',
    access: 'public',
    description: 'Curated business-ready data - public API access',
    baseUrl: 'abfss://gold@scoutanalyticsdata.dfs.core.windows.net',
    authRequired: false
  }
};

// Gold layer data assets (publicly accessible)
export const GOLD_DATA_ASSETS: DataAsset[] = [
  {
    name: 'transactions_summary',
    layer: 'gold',
    path: '/transactions/summary/',
    format: 'delta',
    updateFrequency: 'Daily at 02:00 UTC',
    schema: {
      transaction_date: 'date',
      region: 'string',
      category: 'string',
      total_amount: 'decimal(15,2)',
      transaction_count: 'integer',
      avg_order_value: 'decimal(10,2)',
      unique_customers: 'integer'
    },
    description: 'Daily aggregated transaction metrics by region and category'
  },
  {
    name: 'regional_kpis',
    layer: 'gold',
    path: '/regional/kpis/',
    format: 'delta',
    updateFrequency: 'Weekly on Sundays',
    schema: {
      region: 'string',
      period: 'date',
      revenue: 'decimal(15,2)',
      growth_rate: 'decimal(5,2)',
      market_share: 'decimal(5,2)',
      customer_acquisition: 'integer',
      churn_rate: 'decimal(5,2)'
    },
    description: 'Regional performance KPIs and growth indicators'
  },
  {
    name: 'product_insights',
    layer: 'gold',
    path: '/products/insights/',
    format: 'delta',
    updateFrequency: 'Daily at 03:00 UTC',
    schema: {
      product_id: 'string',
      product_name: 'string',
      category: 'string',
      revenue: 'decimal(15,2)',
      units_sold: 'integer',
      substitution_score: 'decimal(3,2)',
      top_substitute: 'string'
    },
    description: 'Product performance metrics and substitution patterns'
  },
  {
    name: 'customer_segments',
    layer: 'gold',
    path: '/customers/segments/',
    format: 'delta',
    updateFrequency: 'Monthly on 1st',
    schema: {
      segment_id: 'string',
      age_group: 'string',
      income_bracket: 'string',
      region: 'string',
      avg_spend: 'decimal(10,2)',
      frequency: 'integer',
      preferred_categories: 'array<string>'
    },
    description: 'Customer demographic and behavioral segments'
  },
  {
    name: 'market_trends',
    layer: 'gold',
    path: '/trends/market/',
    format: 'delta',
    updateFrequency: 'Daily at 04:00 UTC',
    schema: {
      trend_date: 'date',
      category: 'string',
      trend_type: 'string',
      trend_value: 'decimal(10,2)',
      confidence_score: 'decimal(3,2)',
      forecast_period: 'integer'
    },
    description: 'Market trend analysis and forecasting data'
  }
];

// Access configuration
export const ACCESS_CONFIG = {
  // Gold layer SAS token (rotate weekly)
  goldSasToken: import.meta.env.VITE_GOLD_SAS_TOKEN || '',
  
  // Delta Sharing endpoint
  deltaSharingEndpoint: import.meta.env.VITE_DELTA_SHARING_ENDPOINT || 'http://localhost:8080',
  deltaSharingToken: import.meta.env.VITE_DELTA_SHARING_TOKEN || 'scout-analytics-public-token-2024',
  
  // API endpoints that expose Gold data
  publicApiEndpoints: [
    '/scout/analytics',
    '/api/transactions',
    '/api/regional-performance',
    '/api/category-mix',
    '/api/volume'
  ],
  
  // Data governance
  dataRetention: {
    bronze: '2 years',
    silver: '5 years', 
    gold: '7 years'
  },
  
  complianceLevel: 'SOC2',
  encryptionAtRest: true,
  encryptionInTransit: true
};

// Utility functions
export const getGoldAssetUrl = (assetName: string): string => {
  const asset = GOLD_DATA_ASSETS.find(a => a.name === assetName);
  if (!asset) {
    throw new Error(`Gold asset '${assetName}' not found`);
  }
  
  const baseUrl = MEDALLION_LAYERS.gold.baseUrl;
  return `${baseUrl}${asset.path}`;
};

export const getAssetSchema = (assetName: string): Record<string, string> => {
  const asset = GOLD_DATA_ASSETS.find(a => a.name === assetName);
  if (!asset) {
    throw new Error(`Asset '${assetName}' not found`);
  }
  
  return asset.schema;
};

export const isPublicAccess = (layer: MedallionLayer['name']): boolean => {
  return MEDALLION_LAYERS[layer].access === 'public';
};

export const validateDataGovernance = (): { 
  compliant: boolean; 
  issues: string[] 
} => {
  const issues: string[] = [];
  
  // Check if Gold SAS token is configured
  if (!ACCESS_CONFIG.goldSasToken) {
    issues.push('Gold layer SAS token not configured');
  }
  
  // Check if encryption is enabled
  if (!ACCESS_CONFIG.encryptionAtRest) {
    issues.push('Encryption at rest is not enabled');
  }
  
  if (!ACCESS_CONFIG.encryptionInTransit) {
    issues.push('Encryption in transit is not enabled');
  }
  
  // Check data retention policies
  if (!ACCESS_CONFIG.dataRetention.gold) {
    issues.push('Gold layer data retention policy not defined');
  }
  
  return {
    compliant: issues.length === 0,
    issues
  };
};