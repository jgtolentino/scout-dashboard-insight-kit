// Smart API Configuration with Multi-Platform Support

/**
 * Auto-detect deployment platform and configure API URL accordingly
 */
const getApiBaseUrl = (): string => {
  // 1. Check environment variable first (set by build platforms)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Detect platform in browser environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname.includes('vercel.app')) {
      return 'https://scout-analytics-api.azurewebsites.net';
    } else if (hostname.includes('netlify.app')) {
      return 'https://scout-analytics-api.azurewebsites.net';
    } else if (hostname.includes('azurestaticapps.net')) {
      return 'https://scout-analytics-api.azurewebsites.net';
    } else if (hostname.includes('azurewebsites.net')) {
      return 'https://scout-analytics-api.azurewebsites.net';
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  
  // 3. Default fallback
  return 'http://localhost:5000';
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
 * Get platform-specific configuration
 */
const getPlatformConfig = () => {
  const platform = detectPlatform();
  
  return {
    platform,
    apiUrl: getApiBaseUrl(),
    isProduction: platform !== 'local',
    supportsServerlessFunction: ['vercel', 'netlify'].includes(platform),
    supportsStaticSite: ['vercel', 'netlify', 'azure-swa'].includes(platform),
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