// Health check endpoint
const { connectWithRetry } = require('./_db');
const { cors, runMiddleware } = require('./_middleware');

export default async function handler(req, res) {
  try {
    // Handle CORS
    await runMiddleware(req, res, cors);
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const startTime = Date.now();
    
    // Test database connection
    let dbStatus = 'unknown';
    let dbLatency = 0;
    
    try {
      const dbStartTime = Date.now();
      await connectWithRetry(1); // Single retry for health check
      dbLatency = Date.now() - dbStartTime;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'disconnected';
      dbLatency = Date.now() - startTime;
    }

    const response = {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        latency: `${dbLatency}ms`
      },
      environment: process.env.NODE_ENV || 'development',
      region: process.env.VERCEL_REGION || 'unknown'
    };

    const statusCode = dbStatus === 'connected' ? 200 : 503;
    res.status(statusCode).json(response);

  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}