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
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Survey ID is required' });
    }

    // Get user's preferred language
    const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
    const supportedLanguages = ['en', 'ko'];
    const preferredLanguage = supportedLanguages.includes(language) ? language : 'en';

    // Fetch survey
    const survey = await Survey.findByPk(id, {
      attributes: [
        'id', 'name', 'description', 'category', 'language', 'baseId',
        'estimatedTime', 'difficulty', 'tags', 'createdAt'
      ]
    });

    if (!survey || !survey.isActive) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Transform for frontend
    const transformedSurvey = {
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
    };

    res.status(200).json({ survey: transformedSurvey });

  } catch (error) {
    handleError(res, error, 'Failed to fetch survey');
  }
}