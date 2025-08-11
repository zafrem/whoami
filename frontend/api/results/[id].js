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
    
    const { Result, Survey } = initModels();
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Result ID is required' });
    }

    // Build where clause - allow access to own results or guest results by session
    const where = { id };
    
    if (req.user) {
      // Authenticated user can access their own results
      where.userId = req.user.id;
    } else {
      // Guest users need sessionId from query params
      const { sessionId } = req.query;
      if (sessionId) {
        where.sessionId = sessionId;
        where.userId = null; // Ensure it's a guest result
      } else {
        return res.status(401).json({ error: 'Authentication required' });
      }
    }

    // Fetch result with survey data
    const result = await Result.findOne({
      where,
      include: [{
        model: Survey,
        as: 'survey',
        attributes: ['id', 'name', 'description', 'category', 'language', 'analysisJson']
      }]
    });

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    // Get user's preferred language for survey content
    const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
    const supportedLanguages = ['en', 'ko'];
    const preferredLanguage = supportedLanguages.includes(language) ? language : 'en';

    // Transform result for frontend
    const transformedResult = {
      id: result.id,
      surveyId: result.surveyId,
      answersJson: result.answersJson,
      resultsJson: result.resultsJson,
      completedAt: result.completedAt,
      timeSpent: result.timeSpent,
      survey: {
        id: result.survey.id,
        name: typeof result.survey.name === 'string' ? result.survey.name : result.survey.name[preferredLanguage] || result.survey.name.en,
        description: typeof result.survey.description === 'string' ? result.survey.description : result.survey.description[preferredLanguage] || result.survey.description.en,
        category: result.survey.category,
        language: result.survey.language,
        analysis: result.survey.analysisJson
      }
    };

    res.status(200).json(transformedResult);

  } catch (error) {
    handleError(res, error, 'Failed to fetch result');
  }
}