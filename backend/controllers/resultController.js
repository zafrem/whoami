const { Result, Survey, User } = require('../models');
const { v4: uuidv4 } = require('uuid');

const calculateResults = (answers, analysisJson) => {
  try {
    const { dimensions, resultTypes } = analysisJson;
    const scores = {};
    const results = {};

    dimensions.forEach(dimension => {
      scores[dimension.key] = 0;
      dimension.questions.forEach(questionId => {
        const answer = answers[questionId];
        if (answer !== undefined) {
          scores[dimension.key] += dimension.scoring[answer] || 0;
        }
      });
      scores[dimension.key] = Math.min(100, Math.max(0, scores[dimension.key]));
    });

    resultTypes.forEach(type => {
      const score = scores[type.dimension];
      for (const category of type.categories) {
        if (score >= category.min && score <= category.max) {
          results[type.dimension] = {
            category: category.key,
            score,
            description: category.description,
            traits: category.traits || []
          };
          break;
        }
      }
    });

    return {
      scores,
      results,
      summary: generateSummary(results, analysisJson.summary)
    };
  } catch (error) {
    console.error('Result calculation error:', error);
    throw new Error('Failed to calculate results');
  }
};

const generateSummary = (results, summaryTemplate) => {
  if (!summaryTemplate) return 'Results calculated successfully.';
  
  let summary = summaryTemplate.text || 'Your personality profile has been calculated.';
  
  Object.entries(results).forEach(([dimension, result]) => {
    summary = summary.replace(new RegExp(`\\{${dimension}\\}`, 'g'), result.category);
  });
  
  return summary;
};

const submitResult = async (req, res) => {
  try {
    const { surveyId, answers, timeSpent, sessionId, isExternal } = req.body;
    const userId = req.user?.id;

    if (!userId && !sessionId) {
      return res.status(400).json({ 
        error: 'Either authentication or session ID is required' 
      });
    }

    const survey = await Survey.findByPk(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    let calculatedResults;
    let finalAnswers = answers;

    // Handle external surveys differently
    if (isExternal || survey.isExternal) {
      // For external surveys, create a simple completion record
      calculatedResults = {
        scores: {},
        results: {
          external: {
            category: 'completed',
            score: 100,
            description: 'External survey completed successfully',
            traits: ['completed']
          }
        },
        summary: 'External survey completed successfully. Results are managed by the external platform.',
        externalUrl: survey.externalUrl
      };
      finalAnswers = { external_completion: true };
    } else {
      // Standard survey result calculation
      calculatedResults = calculateResults(answers, survey.analysisJson);
    }

    const result = await Result.create({
      userId,
      surveyId,
      answersJson: finalAnswers,
      resultsJson: calculatedResults,
      timeSpent: timeSpent || 0,
      sessionId: sessionId || uuidv4(),
      isCompleted: true
    });

    res.status(201).json({
      message: isExternal || survey.isExternal ? 'External survey completion recorded' : 'Results submitted successfully',
      resultId: result.id,
      results: calculatedResults,
      needsRegistration: !userId
    });
  } catch (error) {
    console.error('Submit result error:', error);
    res.status(500).json({ error: 'Failed to submit results' });
  }
};

const getUserResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const { surveyId, limit = 10, offset = 0 } = req.query;

    const where = { userId, isCompleted: true };
    if (surveyId) {
      where.surveyId = surveyId;
    }

    const results = await Result.findAndCountAll({
      where,
      include: [{
        model: Survey,
        as: 'survey',
        attributes: ['id', 'name', 'description', 'category']
      }],
      order: [['completedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      results: results.rows,
      total: results.count,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(results.count / limit)
    });
  } catch (error) {
    console.error('Get user results error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

const getResult = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const where = { id, isCompleted: true };
    if (userId) {
      where.userId = userId;
    }

    const result = await Result.findOne({
      where,
      include: [{
        model: Survey,
        as: 'survey',
        attributes: ['id', 'name', 'description', 'category']
      }, {
        model: User,
        as: 'user',
        attributes: ['id', 'username'],
        required: false
      }]
    });

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    if (!userId && result.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(result);
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
};

const compareResults = async (req, res) => {
  try {
    const { resultId1, resultId2 } = req.params;
    const userId = req.user.id;

    const [result1, result2] = await Promise.all([
      Result.findOne({
        where: { id: resultId1, userId, isCompleted: true },
        include: [{ model: Survey, as: 'survey', attributes: ['name'] }]
      }),
      Result.findOne({
        where: { id: resultId2, userId, isCompleted: true },
        include: [{ model: Survey, as: 'survey', attributes: ['name'] }]
      })
    ]);

    if (!result1 || !result2) {
      return res.status(404).json({ error: 'One or both results not found' });
    }

    if (result1.surveyId !== result2.surveyId) {
      return res.status(400).json({ 
        error: 'Cannot compare results from different surveys' 
      });
    }

    const comparison = {
      survey: result1.survey.name,
      result1: {
        id: result1.id,
        completedAt: result1.completedAt,
        results: result1.resultsJson
      },
      result2: {
        id: result2.id,
        completedAt: result2.completedAt,
        results: result2.resultsJson
      },
      differences: calculateDifferences(result1.resultsJson, result2.resultsJson)
    };

    res.json(comparison);
  } catch (error) {
    console.error('Compare results error:', error);
    res.status(500).json({ error: 'Failed to compare results' });
  }
};

const calculateDifferences = (results1, results2) => {
  const differences = {};
  
  if (results1.scores && results2.scores) {
    Object.keys(results1.scores).forEach(dimension => {
      const score1 = results1.scores[dimension];
      const score2 = results2.scores[dimension];
      differences[dimension] = {
        scoreDifference: score2 - score1,
        percentageChange: score1 > 0 ? ((score2 - score1) / score1) * 100 : 0
      };
    });
  }
  
  return differences;
};

const exportResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    const userId = req.user.id;

    const result = await Result.findOne({
      where: { id, userId, isCompleted: true },
      include: [{
        model: Survey,
        as: 'survey',
        attributes: ['id', 'name', 'description', 'category']
      }]
    });

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    if (format === 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="survey-result-${id}.json"`);
      res.setHeader('Content-Type', 'application/json');
      res.json(result);
    } else {
      res.status(400).json({ error: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Export result error:', error);
    res.status(500).json({ error: 'Failed to export result' });
  }
};

module.exports = {
  submitResult,
  getUserResults,
  getResult,
  compareResults,
  exportResult
};