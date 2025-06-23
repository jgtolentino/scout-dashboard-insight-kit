// Vercel Serverless Health Check for Scout Analytics
export default function handler(req, res) {
  const startTime = process.hrtime();
  
  try {
    // Platform detection
    const platform = 'vercel';
    const environment = process.env.VERCEL_ENV || 'development';
    const region = process.env.VERCEL_REGION || 'unknown';
    const deployment = process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown';
    
    // Performance metrics
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const responseTime = Math.round((seconds * 1000) + (nanoseconds / 1000000));
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      platform: platform,
      environment: environment,
      region: region,
      deployment: deployment,
      performance: {
        responseTime: `${responseTime}ms`,
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
        }
      },
      features: {
        apiProxy: true,
        staticSite: true,
        serverless: true,
        edgeNetwork: true
      },
      endpoints: {
        api: process.env.VITE_API_URL || 'https://scout-analytics-api.azurewebsites.net',
        dashboard: req.headers.host ? `https://${req.headers.host}` : 'unknown'
      },
      enterprise: {
        dualPlatformStrategy: true,
        azurePrimary: true,
        vercelBackup: true,
        bulletproofCI: true
      }
    };
    
    // CORS headers for API access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache');
    
    res.status(200).json(health);
    
  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      platform: 'vercel',
      error: error.message,
      message: 'Health check failed'
    });
  }
}