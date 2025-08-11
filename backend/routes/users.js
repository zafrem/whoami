const express = require('express');
const { auth } = require('../middleware/auth');
const { User, Result, Survey } = require('../models');

const router = express.Router();

router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalSurveys = await Result.count({
      where: { userId, isCompleted: true }
    });

    const recentResults = await Result.findAll({
      where: { userId, isCompleted: true },
      include: [{
        model: Survey,
        as: 'survey',
        attributes: ['id', 'name', 'category']
      }],
      order: [['completedAt', 'DESC']],
      limit: 5
    });

    const surveyCategories = await Result.findAll({
      where: { userId, isCompleted: true },
      include: [{
        model: Survey,
        as: 'survey',
        attributes: ['id', 'category']
      }],
      attributes: ['surveyId'],
      group: ['surveyId', 'survey.id', 'survey.category']
    });

    const categoryCounts = {};
    surveyCategories.forEach(result => {
      const category = result.survey.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      },
      stats: {
        totalSurveys,
        categoryCounts
      },
      recentResults
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

module.exports = router;