const { connectWithRetry } = require('../../_db');
const { initModels } = require('../../_models');
const { cors, optionalAuth, runMiddleware, handleError } = require('../../_middleware');

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

    // Fetch survey with questions
    const survey = await Survey.findByPk(id, {
      attributes: ['id', 'questionsJson', 'analysisJson', 'isActive']
    });

    if (!survey || !survey.isActive) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.status(200).json({
      questions: survey.questionsJson,
      analysis: survey.analysisJson
    });

  } catch (error) {
    handleError(res, error, 'Failed to fetch survey questions');
  }
}