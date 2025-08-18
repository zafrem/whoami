const { Survey, User, Group, LLMConfig, LLMLog } = require('../models');
const llmService = require('../services/llmService');

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

// LLM Configuration Management
const getLLMConfigs = async (req, res) => {
  try {
    const configs = await LLMConfig.findAll({
      order: [['provider', 'ASC'], ['createdAt', 'DESC']]
    });
    
    // Don't send encrypted API keys to frontend
    const sanitizedConfigs = configs.map(config => ({
      ...config.toJSON(),
      apiKey: config.apiKey ? '••••••••' : null
    }));
    
    res.json({ configs: sanitizedConfigs });
  } catch (error) {
    console.error('Get LLM configs error:', error);
    res.status(500).json({ error: 'Failed to fetch LLM configurations' });
  }
};

const createLLMConfig = async (req, res) => {
  try {
    const { provider, apiKey, apiEndpoint, model, isActive, isDefault, config } = req.body;
    
    // If this is being set as default, unset other defaults
    if (isDefault) {
      await LLMConfig.update({ isDefault: false }, { where: {} });
    }
    
    // Encrypt API key if provided
    let encryptedApiKey = null;
    if (apiKey) {
      encryptedApiKey = JSON.stringify(llmService.encryptApiKey(apiKey));
    }
    
    const llmConfig = await LLMConfig.create({
      provider,
      apiKey: encryptedApiKey,
      apiEndpoint,
      model,
      isActive: isActive || false,
      isDefault: isDefault || false,
      config: config || {}
    });
    
    // Don't send encrypted API key back
    const response = llmConfig.toJSON();
    response.apiKey = response.apiKey ? '••••••••' : null;
    
    res.status(201).json({
      message: 'LLM configuration created successfully',
      config: response
    });
  } catch (error) {
    console.error('Create LLM config error:', error);
    res.status(500).json({ error: 'Failed to create LLM configuration' });
  }
};

const updateLLMConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { provider, apiKey, apiEndpoint, model, isActive, isDefault, config } = req.body;
    
    const llmConfig = await LLMConfig.findByPk(id);
    if (!llmConfig) {
      return res.status(404).json({ error: 'LLM configuration not found' });
    }
    
    // If this is being set as default, unset other defaults
    if (isDefault) {
      await LLMConfig.update({ isDefault: false }, { where: {} });
    }
    
    const updates = {};
    if (provider !== undefined) updates.provider = provider;
    if (apiEndpoint !== undefined) updates.apiEndpoint = apiEndpoint;
    if (model !== undefined) updates.model = model;
    if (isActive !== undefined) updates.isActive = isActive;
    if (isDefault !== undefined) updates.isDefault = isDefault;
    if (config !== undefined) updates.config = config;
    
    // Handle API key update
    if (apiKey && apiKey !== '••••••••') {
      updates.apiKey = JSON.stringify(llmService.encryptApiKey(apiKey));
    }
    
    await llmConfig.update(updates);
    
    // Don't send encrypted API key back
    const response = llmConfig.toJSON();
    response.apiKey = response.apiKey ? '••••••••' : null;
    
    res.json({
      message: 'LLM configuration updated successfully',
      config: response
    });
  } catch (error) {
    console.error('Update LLM config error:', error);
    res.status(500).json({ error: 'Failed to update LLM configuration' });
  }
};

const deleteLLMConfig = async (req, res) => {
  try {
    const { id } = req.params;
    
    const llmConfig = await LLMConfig.findByPk(id);
    if (!llmConfig) {
      return res.status(404).json({ error: 'LLM configuration not found' });
    }
    
    await llmConfig.destroy();
    
    res.json({ message: 'LLM configuration deleted successfully' });
  } catch (error) {
    console.error('Delete LLM config error:', error);
    res.status(500).json({ error: 'Failed to delete LLM configuration' });
  }
};

// LLM Logs Management
const getLLMLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, provider, operation, success } = req.query;
    const offset = (page - 1) * limit;
    
    const filters = {};
    if (provider) filters.provider = provider;
    if (operation) filters.operation = operation;
    if (success !== undefined) filters.success = success === 'true';
    
    const logs = await llmService.getLogs(parseInt(limit), offset, filters);
    
    res.json({
      logs: logs.rows,
      total: logs.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(logs.count / limit)
    });
  } catch (error) {
    console.error('Get LLM logs error:', error);
    res.status(500).json({ error: 'Failed to fetch LLM logs' });
  }
};

const getLLMLogDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const log = await LLMLog.findByPk(id, {
      include: [
        { model: User, as: 'initiator', attributes: ['id', 'username'] },
        { model: Group, as: 'group', attributes: ['id', 'name'] }
      ]
    });
    
    if (!log) {
      return res.status(404).json({ error: 'LLM log not found' });
    }
    
    res.json({ log });
  } catch (error) {
    console.error('Get LLM log detail error:', error);
    res.status(500).json({ error: 'Failed to fetch LLM log details' });
  }
};

// Get all groups with creator information
const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [{
        model: User,
        as: 'creator',
        attributes: ['username']
      }],
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'name', 'description', 'maxParticipants', 
        'currentParticipants', 'matchingType', 'isActive', 'createdAt'
      ]
    });

    // Format the response to include creator username
    const formattedGroups = groups.map(group => ({
      ...group.toJSON(),
      creatorUsername: group.creator?.username || 'Unknown'
    }));

    res.json({ groups: formattedGroups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
};

// Test LLM Configuration
const testLLMConfig = async (req, res) => {
  try {
    const { id } = req.params;
    
    const config = await LLMConfig.findByPk(id);
    if (!config) {
      return res.status(404).json({ error: 'LLM configuration not found' });
    }
    
    // Test with a simple prompt
    const testPrompt = 'Please respond with "LLM configuration test successful" to confirm the connection is working.';
    
    try {
      const response = await llmService.callLLM(config, testPrompt);
      res.json({
        success: true,
        message: 'LLM configuration test successful',
        response: response
      });
    } catch (error) {
      res.json({
        success: false,
        message: 'LLM configuration test failed',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Test LLM config error:', error);
    res.status(500).json({ error: 'Failed to test LLM configuration' });
  }
};

module.exports = {
  getDashboard,
  getAllSurveys,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getAllUsers,
  updateUser,
  getAllGroups,
  // LLM Configuration
  getLLMConfigs,
  createLLMConfig,
  updateLLMConfig,
  deleteLLMConfig,
  testLLMConfig,
  // LLM Logs
  getLLMLogs,
  getLLMLogDetail
};