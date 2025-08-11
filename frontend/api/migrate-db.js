// Database migration endpoint - REMOVE IN PRODUCTION
const seedSurveys = require('./migrate');
const { cors, runMiddleware, handleError } = require('./_middleware');

export default async function handler(req, res) {
  try {
    // Handle CORS
    await runMiddleware(req, res, cors);
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Use POST to run migration.' });
    }

    // Simple protection - require secret key
    const { secret } = req.body;
    if (secret !== process.env.MIGRATION_SECRET) {
      return res.status(401).json({ error: 'Invalid migration secret' });
    }

    console.log('Starting database migration via API...');
    await seedSurveys();
    
    res.status(200).json({ 
      success: true, 
      message: 'Database migration completed successfully!' 
    });

  } catch (error) {
    console.error('Migration failed:', error);
    handleError(res, error, 'Migration failed');
  }
}