const { connectWithRetry } = require('../_db');
const { initModels } = require('../_models');
const { cors, authenticate, optionalAuth, runMiddleware, handleError } = require('../_middleware');

// Helper function to generate summary
const generateSummary = (results, summaryTemplate) => {
  if (!summaryTemplate || !summaryTemplate.text) return 'Results calculated successfully.';
  
  let summary = summaryTemplate.text;
  
  Object.entries(results).forEach(([dimension, result]) => {
    summary = summary.replace(new RegExp(`\\{${dimension}\\}`, 'g'), result.key);
  });
  
  return summary;
};

// Helper function to calculate scores
const calculateScores = (answers, analysis) => {
  const scores = {};
  const resultCategories = {};

  analysis.dimensions.forEach(dimension => {
    let totalScore = 0;
    let maxScore = 0;

    dimension.questions.forEach(questionId => {
      const answer = answers[questionId];
      if (answer !== undefined) {
        const score = dimension.scoring[answer] || 0;
        totalScore += score;
        maxScore += Math.max(...Object.values(dimension.scoring));
      }
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    scores[dimension.key] = percentage;

    // Determine category
    const resultType = analysis.resultTypes.find(rt => rt.dimension === dimension.key);
    if (resultType) {
      const category = resultType.categories.find(cat => 
        percentage >= cat.min && percentage <= cat.max
      );
      if (category) {
        resultCategories[dimension.key] = {
          key: category.key,
          description: category.description,
          traits: category.traits || []
        };
      }
    }
  });

  return { scores, resultCategories };
};

export default async function handler(req, res) {
  try {
    // Handle CORS
    await runMiddleware(req, res, cors);
    
    // Connect to database
    await connectWithRetry();
    const { Result, Survey, User } = initModels();
    
    if (req.method === 'GET') {
      // Get results (requires authentication)
      await runMiddleware(req, res, authenticate);
      
      const { limit = 50, category } = req.query;
      
      // Build where clause
      const where = { userId: req.user.id };
      
      // Fetch results with survey data
      const results = await Result.findAll({
        where,
        include: [{
          model: Survey,
          as: 'survey',
          attributes: ['id', 'name', 'category', 'language'],
          where: category ? { category } : undefined
        }],
        order: [['completedAt', 'DESC']],
        limit: Math.min(parseInt(limit), 100)
      });

      // Transform results for frontend
      const transformedResults = results.map(result => ({
        id: result.id,
        surveyId: result.surveyId,
        scores: result.resultsJson?.scores || {},
        personalityType: result.resultsJson?.personalityType || null,
        completedAt: result.completedAt,
        timeSpent: result.timeSpent,
        resultsJson: result.resultsJson,
        survey: {
          id: result.survey.id,
          name: typeof result.survey.name === 'string' ? result.survey.name : result.survey.name.en,
          category: result.survey.category,
          language: result.survey.language
        }
      }));

      res.status(200).json({
        results: transformedResults,
        total: transformedResults.length
      });
      
    } else if (req.method === 'POST') {
      // Submit result (optional auth for guest users)
      await runMiddleware(req, res, optionalAuth);
      
      const { surveyId, answers, timeSpent, sessionId } = req.body;

      // Validate input
      if (!surveyId || !answers) {
        return res.status(400).json({ error: 'Survey ID and answers are required' });
      }

      // Fetch survey for analysis
      const survey = await Survey.findByPk(surveyId, {
        attributes: ['id', 'analysisJson', 'isActive']
      });

      if (!survey || !survey.isActive) {
        return res.status(404).json({ error: 'Survey not found' });
      }

      // Calculate scores
      const { scores, resultCategories } = calculateScores(answers, survey.analysisJson);

      // Generate personality type (for MBTI-like surveys)
      let personalityType = null;
      if (survey.analysisJson.summary?.text) {
        const typeKeys = Object.keys(resultCategories).map(key => resultCategories[key].key);
        personalityType = typeKeys.join('');
      }

      // Create result with properly structured resultsJson
      const resultsJson = {
        scores,
        results: resultCategories,
        personalityType,
        summary: survey.analysisJson.summary?.text ? 
          generateSummary(resultCategories, survey.analysisJson.summary) : 
          'Results calculated successfully.'
      };

      const resultData = {
        surveyId,
        answersJson: answers,
        resultsJson,
        timeSpent: timeSpent || null,
        completedAt: new Date()
      };

      if (req.user) {
        resultData.userId = req.user.id;
      } else if (sessionId) {
        resultData.sessionId = sessionId;
      }

      const result = await Result.create(resultData);

      // If user is not authenticated, return flag for registration prompt
      const response = {
        success: true,
        message: 'Results submitted successfully',
        resultId: result.id,
        results: resultsJson,
        needsRegistration: !req.user
      };

      res.status(201).json(response);
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    handleError(res, error, 'Results operation failed');
  }
}