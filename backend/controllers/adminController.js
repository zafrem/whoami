const { Survey, User } = require('../models');

const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalSurveys, activeUsers] = await Promise.all([
      User.count(),
      Survey.count(),
      User.count({ where: { isActive: true } })
    ]);

    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'username', 'email', 'createdAt', 'lastLogin']
    });

    const recentSurveys = await Survey.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      stats: {
        totalUsers,
        totalSurveys,
        activeUsers
      },
      recentUsers,
      recentSurveys
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

const getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ surveys });
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
};

const createSurvey = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      language,
      questionsJson,
      analysisJson,
      estimatedTime,
      difficulty,
      tags,
      baseId,
      externalUrl,
      isExternal
    } = req.body;

    const survey = await Survey.create({
      name,
      description,
      category,
      language: language || 'en',
      questionsJson,
      analysisJson,
      estimatedTime,
      difficulty: difficulty || 'medium',
      tags: tags || [],
      baseId,
      externalUrl,
      isExternal: isExternal || false,
      isActive: true
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

    const survey = await Survey.findByPk(id);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    await survey.update(updates);

    res.json({
      message: 'Survey updated successfully',
      survey
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

    await survey.destroy();

    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Delete survey error:', error);
    res.status(500).json({ error: 'Failed to delete survey' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'isActive', 'isPro', 'createdAt', 'lastLogin', 'lastLoginLocation', 'birthYear']
    });
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPro, isActive, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow updating specific admin-controlled fields
    const updates = {};
    if (typeof isPro === 'boolean') updates.isPro = isPro;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (role && ['user', 'admin'].includes(role)) updates.role = role;

    await user.update(updates);

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        isPro: user.isPro,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

module.exports = {
  getDashboard,
  getAllSurveys,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getAllUsers,
  updateUser
};