const { connectWithRetry } = require('../_db');
const { initModels } = require('../_models');
const { cors, authenticate, runMiddleware, handleError } = require('../_middleware');

export default async function handler(req, res) {
  try {
    // Handle CORS
    await runMiddleware(req, res, cors);
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Connect to database and authenticate
    await connectWithRetry();
    await runMiddleware(req, res, authenticate);
    
    const { Result, Survey } = initModels();

    // Get user statistics
    const totalResults = await Result.count({ where: { userId: req.user.id } });
    
    // Get category counts
    const categoryResults = await Result.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Survey,
        as: 'survey',
        attributes: ['category']
      }],
      attributes: ['id']
    });

    const categoryCounts = categoryResults.reduce((acc, result) => {
      const category = result.survey.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Get recent results
    const recentResults = await Result.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Survey,
        as: 'survey',
        attributes: ['id', 'name', 'category', 'language']
      }],
      order: [['completedAt', 'DESC']],
      limit: 5
    });

    // Get user's preferred language
    const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
    const supportedLanguages = ['en', 'ko'];
    const preferredLanguage = supportedLanguages.includes(language) ? language : 'en';

    // Transform recent results
    const transformedRecentResults = recentResults.map(result => ({
      id: result.id,
      completedAt: result.completedAt,
      personalityType: result.personalityType,
      survey: {
        id: result.survey.id,
        name: typeof result.survey.name === 'string' ? result.survey.name : result.survey.name[preferredLanguage] || result.survey.name.en,
        category: result.survey.category
      }
    }));

    res.status(200).json({
      stats: {
        totalSurveys: totalResults,
        categoryCounts
      },
      recentResults: transformedRecentResults
    });

  } catch (error) {
    handleError(res, error, 'Failed to fetch dashboard data');
  }
}