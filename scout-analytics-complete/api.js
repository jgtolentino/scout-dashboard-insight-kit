// API Configuration for Azure deployment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://scout-analytics-api.azurewebsites.net/api'
  : 'https://5000-icbji9l1k5o6jqrefi14i-7ba1830f.manusvm.computer/api';

// Mapbox configuration
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww';

export { API_BASE_URL, MAPBOX_ACCESS_TOKEN };

