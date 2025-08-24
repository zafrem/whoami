const { Survey, Result, User } = require('../models');
const { Op } = require('sequelize');

const getAllSurveys = async (req, res) => {
  try {
    const { category, active = 'true' } = req.query;
    const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
    
    const where = {
      language: ['en', 'ko'].includes(language) ? language : 'en'
    };

    if (category) {
      where.category = category;
    }

    if (active !== 'all') {
      where.isActive = active === 'true';
    }

    const surveys = await Survey.findAll({
      where,
      attributes: ['id', 'name', 'description', 'category', 'language', 'estimatedTime', 'difficulty', 'tags', 'baseId', 'surveyTypes'],
      order: [['createdAt', 'DESC']]
    });

    // Transform surveys to include localized names and descriptions
    const transformedSurveys = surveys.map(survey => ({
      id: survey.id,
      name: survey.getLocalizedName(language),
      description: survey.getLocalizedDescription(language),
      category: survey.category,
      language: survey.language,
      estimatedTime: survey.estimatedTime,
      difficulty: survey.difficulty,
      tags: survey.tags,
      baseId: survey.baseId,
      surveyTypes: survey.surveyTypes
    }));

    res.json(transformedSurveys);
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
};

const getSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeQuestions = 'false' } = req.query;
    const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';

    const attributes = ['id', 'name', 'description', 'category', 'language', 'estimatedTime', 'difficulty', 'tags', 'baseId', 'isActive', 'surveyTypes'];
    if (includeQuestions === 'true') {
      attributes.push('questionsJson', 'analysisJson');
    }

    const survey = await Survey.findByPk(id, {
      attributes
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Transform survey to include localized content and isActive status
    const transformedSurvey = {
      id: survey.id,
      name: survey.getLocalizedName(language),
      description: survey.getLocalizedDescription(language),
      category: survey.category,
      language: survey.language,
      estimatedTime: survey.estimatedTime,
      difficulty: survey.difficulty,
      tags: survey.tags,
      baseId: survey.baseId,
      isActive: survey.isActive,
      surveyTypes: survey.surveyTypes
    };

    if (includeQuestions === 'true') {
      transformedSurvey.questionsJson = survey.questionsJson;
      transformedSurvey.analysisJson = survey.analysisJson;
    }

    res.json(transformedSurvey);
  } catch (error) {
    console.error('Get survey error:', error);
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
};

const getSurveyQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'full' } = req.query; // Default to full survey
    const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';

    const survey = await Survey.findByPk(id, {
      attributes: ['id', 'name', 'language', 'questionsJson', 'surveyTypes', 'isActive']
    });

    if (!survey || !survey.isActive) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    let filteredQuestions = survey.questionsJson;
    let estimatedTime = null;
    
    // Filter questions based on survey type if surveyTypes configuration exists
    if (survey.surveyTypes && survey.surveyTypes[type]) {
      const typeConfig = survey.surveyTypes[type];
      const maxQuestions = typeConfig.questions;
      estimatedTime = typeConfig.time;
      
      // Filter questions by priority and limit to maxQuestions
      if (type === 'simple') {
        filteredQuestions = survey.questionsJson.filter(q => q.priority === 1).slice(0, maxQuestions);
      } else if (type === 'general') {
        filteredQuestions = survey.questionsJson.filter(q => q.priority <= 2).slice(0, maxQuestions);
      } else if (type === 'full') {
        filteredQuestions = survey.questionsJson.slice(0, maxQuestions);
      }
    }

    res.json({
      id: survey.id,
      name: survey.getLocalizedName(language),
      language: survey.language,
      type: type,
      estimatedTime: estimatedTime,
      questions: filteredQuestions
    });
  } catch (error) {
    console.error('Get survey questions error:', error);
    res.status(500).json({ error: 'Failed to fetch survey questions' });
  }
};

const getSurveyStats = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findByPk(id);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const totalResponses = await Result.count({
      where: { surveyId: id, isCompleted: true }
    });

    const averageTime = await Result.findOne({
      where: { surveyId: id, timeSpent: { [Op.not]: null } },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('timeSpent')), 'avgTime']
      ]
    });

    const recentResults = await Result.findAll({
      where: { surveyId: id, isCompleted: true },
      limit: 10,
      order: [['completedAt', 'DESC']],
      attributes: ['completedAt', 'timeSpent']
    });

    res.json({
      totalResponses,
      averageTime: averageTime?.dataValues.avgTime || null,
      recentActivity: recentResults
    });
  } catch (error) {
    console.error('Get survey stats error:', error);
    res.status(500).json({ error: 'Failed to fetch survey statistics' });
  }
};

const createSurvey = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      questionsJson,
      analysisJson,
      estimatedTime,
      difficulty,
      tags
    } = req.body;

    const survey = await Survey.create({
      name,
      description,
      category,
      questionsJson,
      analysisJson,
      estimatedTime,
      difficulty,
      tags
    });

    res.status(201).json({
      message: 'Survey created successfully',
      survey
    });
  } catch (error) {
    console.error('Create survey error:', error);
    res.status(500).json({ error: 'Failed to create survey' });
  }
};

const updateSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [updatedRowsCount] = await Survey.update(updates, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const updatedSurvey = await Survey.findByPk(id);
    res.json({
      message: 'Survey updated successfully',
      survey: updatedSurvey
    });
  } catch (error) {
    console.error('Update survey error:', error);
    res.status(500).json({ error: 'Failed to update survey' });
  }
};

const deleteSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findByPk(id);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    await survey.update({ isActive: false });

    res.json({ message: 'Survey deactivated successfully' });
  } catch (error) {
    console.error('Delete survey error:', error);
    res.status(500).json({ error: 'Failed to delete survey' });
  }
};

module.exports = {
  getAllSurveys,
  getSurvey,
  getSurveyQuestions,
  getSurveyStats,
  createSurvey,
  updateSurvey,
  deleteSurvey
};