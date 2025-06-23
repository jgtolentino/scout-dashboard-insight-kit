// Enterprise Scout Analytics - Multi-Platform API Configuration

/**
 * Enterprise API URL resolver with environment-specific routing
 */
const getApiBaseUrl = (): string => {
  // 1. Environment variable override (highest priority)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Platform-specific URL detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isPreview = hostname.includes('preview') || hostname.includes('staging');
    
    // Vercel deployment (backup/alternative platform)
    if (hostname.includes('vercel.app')) {
      return isPreview 
        ? 'https://preview-api.scout-analytics.com'
        : 'https://prod-api.scout-analytics.com';
    }
    
    // Azure App Service (primary production platform)
    if (hostname.includes('azurewebsites.net')) {
      return isPreview
        ? 'https://scout-analytics-dashboard-preview.azurewebsites.net/api'
        : 'https://scout-analytics-api.azurewebsites.net';
    }
    
    // Azure Static Web Apps
    if (hostname.includes('azurestaticapps.net')) {
      return 'https://scout-analytics-api.azurewebsites.net';
    }
    
    // Netlify (additional backup platform)  
    if (hostname.includes('netlify.app')) {
      return 'https://scout-analytics-api.azurewebsites.net';
    }
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  
  // 3. Server-side rendering fallback
  return 'https://scout-analytics-api.azurewebsites.net';
};

/**
 * Detect current deployment platform
 */
const detectPlatform = (): string => {
  if (typeof window === 'undefined') return 'server';
  
  const hostname = window.location.hostname;
  
  if (hostname.includes('vercel.app')) return 'vercel';
  if (hostname.includes('netlify.app')) return 'netlify';  
  if (hostname.includes('azurestaticapps.net')) return 'azure-swa';
  if (hostname.includes('azurewebsites.net')) return 'azure-app-service';
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'local';
  
  return 'unknown';
};

/**
 * Enterprise platform configuration with performance optimizations
 */
const getPlatformConfig = () => {
  const platform = detectPlatform();
  const isVercel = platform === 'vercel';
  const isAzure = platform.startsWith('azure');
  
  return {
    platform,
    apiUrl: getApiBaseUrl(),
    isProduction: platform !== 'local',
    isEnterprise: isAzure || platform !== 'local',
    
    // Platform capabilities
    supportsServerlessFunction: ['vercel', 'netlify'].includes(platform),
    supportsStaticSite: ['vercel', 'netlify', 'azure-swa'].includes(platform),
    supportsAzureIntegration: isAzure,
    
    // Performance configuration
    timeout: isVercel ? 10000 : 30000, // Shorter timeout for Vercel
    retries: isVercel ? 2 : 3,
    retryDelay: 1000,
    
    // Feature flags
    features: {
      azureOpenAI: isAzure,
      azureKeyVault: isAzure,
      azureManagedIdentity: isAzure,
      realTimeAnalytics: true,
      advancedCharts: true,
      geoMapping: true,
      aiInsights: isAzure,
    },
    
    // Monitoring and analytics
    analytics: {
      enabled: platform !== 'local',
      platform: platform,
      environment: import.meta.env.MODE || 'production',
    }
  };
};

// Main API configuration
const API_BASE_URL = getApiBaseUrl();

// Mapbox configuration
const MAPBOX_ACCESS_TOKEN = import.meta.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww';

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🔗 API Configuration:', {
    platform: detectPlatform(),
    apiUrl: API_BASE_URL,
    environment: import.meta.env.MODE,
  });
}

export { 
  API_BASE_URL, 
  MAPBOX_ACCESS_TOKEN,
  getApiBaseUrl,
  detectPlatform,
  getPlatformConfig
};