// API Configuration for development and production
const API_BASE_URL = import.meta.env.VITE_USE_MOCKS === 'true'
  ? '/api' // This will be proxied to the mock server in development
  : 'https://scout-analytics-api.azurewebsites.net/api';

// Mapbox configuration
const MAPBOX_ACCESS_TOKEN = import.meta.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww';

export { API_BASE_URL, MAPBOX_ACCESS_TOKEN };