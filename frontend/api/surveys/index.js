const { connectWithRetry } = require('../_db');
const { initModels } = require('../_models');
const { cors, optionalAuth, runMiddleware, handleError } = require('../_middleware');

export default async function handler(req, res) {
  try {
    // Handle CORS
    await runMiddleware(req, res, cors);
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Connect to database
    await connectWithRetry();
    await runMiddleware(req, res, optionalAuth);
    
    const { Survey } = initModels();
    const { category, active, limit = 50 } = req.query;

    // Get user's preferred language from Accept-Language header
    const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
    const supportedLanguages = ['en', 'ko'];
    const preferredLanguage = supportedLanguages.includes(language) ? language : 'en';

    // Build where clause
    const where = {
      language: preferredLanguage,
      isActive: active === 'false' ? false : true
    };

    if (category) {
      where.category = category;
    }

    // Fetch surveys
    const surveys = await Survey.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Math.min(parseInt(limit), 100), // Max 100 surveys
      attributes: [
        'id', 'name', 'description', 'category', 'language', 'baseId',
        'estimatedTime', 'difficulty', 'tags', 'createdAt'
      ]
    });

    // Transform for frontend - get localized names
    const transformedSurveys = surveys.map(survey => ({
      id: survey.id,
      name: typeof survey.name === 'string' ? survey.name : survey.name[preferredLanguage] || survey.name.en,
      description: typeof survey.description === 'string' ? survey.description : survey.description[preferredLanguage] || survey.description.en,
      category: survey.category,
      language: survey.language,
      baseId: survey.baseId,
      estimatedTime: survey.estimatedTime,
      difficulty: survey.difficulty,
      tags: survey.tags,
      createdAt: survey.createdAt
    }));

    res.status(200).json({
      surveys: transformedSurveys,
      total: transformedSurveys.length,
      language: preferredLanguage
    });

  } catch (error) {
    handleError(res, error, 'Failed to fetch surveys');
  }
}