// API Configuration for development and production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

// Mapbox configuration
const MAPBOX_ACCESS_TOKEN = import.meta.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww';

export { API_BASE_URL, MAPBOX_ACCESS_TOKEN };